"""AI-powered signal analysis and summarization — multi-provider.

Provider priority for **backend analysis** (signals, threat intel):
  1. Claude (Anthropic)  — preferred for deep reasoning
  2. OpenAI (GPT)        — fallback
  3. Rule-based fallback  — always available

Gemini is reserved for the frontend chat / UI assistant and is NOT
used in this module (see routes/gemini_chat.py instead).
"""
import json
import logging
from typing import List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Lazy-init clients ─────────────────────────────────────────────
_anthropic_client = None
_openai_client = None


def _get_anthropic():
    """Lazy-init Anthropic (Claude) client."""
    global _anthropic_client
    if _anthropic_client is None:
        if not settings.ai_enabled or not settings.anthropic_api_key:
            return None
        try:
            import anthropic
            _anthropic_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        except Exception as exc:
            logger.error("Failed to init Anthropic client: %s", exc)
            return None
    return _anthropic_client


def _get_openai():
    """Lazy-init OpenAI client (fallback)."""
    global _openai_client
    if _openai_client is None:
        if not settings.ai_enabled or not settings.openai_api_key:
            return None
        try:
            from openai import OpenAI
            _openai_client = OpenAI(api_key=settings.openai_api_key)
        except Exception as exc:
            logger.error("Failed to init OpenAI client: %s", exc)
            return None
    return _openai_client


# ── Provider info ─────────────────────────────────────────────────
def _active_provider() -> str:
    """Return which provider will be used."""
    if settings.anthropic_api_key:
        return "claude"
    if settings.openai_api_key:
        return "openai"
    return "fallback"


# ── Claude helpers ────────────────────────────────────────────────
def _claude_chat(system: str, user: str, max_tokens: int = 800) -> Optional[str]:
    client = _get_anthropic()
    if not client:
        return None
    try:
        msg = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text
    except Exception as exc:
        logger.error("Claude call failed: %s", exc)
        return None


def _openai_chat(system: str, user: str, max_tokens: int = 800,
                 json_mode: bool = False) -> Optional[str]:
    client = _get_openai()
    if not client:
        return None
    try:
        kwargs: dict = dict(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content.strip()
    except Exception as exc:
        logger.error("OpenAI call failed: %s", exc)
        return None


# ── Public API ────────────────────────────────────────────────────
def summarize_signal(title: str, snippet: str | None, source: str) -> Optional[str]:
    """Generate a concise 2-3 sentence summary of an OSINT signal.

    Tries Claude first, then OpenAI, then returns None (caller uses fallback).
    """
    system = (
        "You are a cybersecurity analyst. Summarize the following OSINT signal "
        "in 2-3 concise sentences. Focus on: what happened, who is affected, "
        "and potential impact. Be factual and avoid speculation."
    )
    user = f"Source: {source}\nTitle: {title}\nContent: {snippet or 'N/A'}"

    result = _claude_chat(system, user, max_tokens=250)
    if result:
        return result

    result = _openai_chat(system, user, max_tokens=200)
    if result:
        return result

    return None


def analyze_signals(signals_data: List[dict]) -> Optional[dict]:
    """Perform AI analysis across multiple signals to identify patterns.

    Returns dict with: analysis, threat_level, key_entities, recommended_actions, provider
    """
    signal_descriptions = []
    for i, sig in enumerate(signals_data[:20], 1):
        signal_descriptions.append(
            f"{i}. [{sig.get('source', 'unknown')}] {sig.get('title', '')} "
            f"(severity: {sig.get('severity', 0)})"
        )
    signals_text = "\n".join(signal_descriptions)

    system = (
        "You are a senior cybersecurity threat analyst. Analyze the following "
        "collection of OSINT signals and provide:\n"
        "1. A brief overall analysis (2-3 paragraphs)\n"
        "2. An overall threat level (low/medium/high/critical)\n"
        "3. Key entities mentioned (organizations, threat actors, CVEs, etc.)\n"
        "4. Recommended actions for a security team\n\n"
        "Respond in valid JSON with keys: analysis, threat_level, key_entities (array), "
        "recommended_actions (array)."
    )
    user = f"Current OSINT signals:\n{signals_text}"

    # ── Try Claude first ──
    raw = _claude_chat(system, user, max_tokens=1000)
    if raw:
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = "\n".join(cleaned.split("\n")[1:])
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
            result = json.loads(cleaned)
            return {
                "analysis": result.get("analysis", ""),
                "threat_level": result.get("threat_level", "medium"),
                "key_entities": result.get("key_entities", []),
                "recommended_actions": result.get("recommended_actions", []),
                "provider": "claude",
            }
        except json.JSONDecodeError:
            logger.warning("Claude returned non-JSON, falling back")

    # ── Fallback to OpenAI ──
    raw = _openai_chat(system, user, max_tokens=800, json_mode=True)
    if raw:
        try:
            result = json.loads(raw)
            return {
                "analysis": result.get("analysis", ""),
                "threat_level": result.get("threat_level", "medium"),
                "key_entities": result.get("key_entities", []),
                "recommended_actions": result.get("recommended_actions", []),
                "provider": "openai",
            }
        except json.JSONDecodeError:
            logger.warning("OpenAI returned non-JSON")

    return None


def generate_fallback_summary(title: str, snippet: str | None) -> str:
    """Generate a basic extractive summary without AI (always available)."""
    text = snippet or title
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
    summary = ". ".join(sentences[:2])
    if summary and not summary.endswith("."):
        summary += "."
    return summary or title
    return summary[:500] if summary else title[:200]
