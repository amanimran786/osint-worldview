"""AI-powered signal analysis and summarization.

Uses OpenAI API (gpt-4o-mini by default) to generate threat summaries,
extract key entities, and recommend actions. Gracefully degrades when
AI is disabled or API key is missing.
"""
import json
import logging
from typing import List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    """Lazy-init OpenAI client (only when actually called)."""
    global _client
    if _client is None:
        if not settings.ai_enabled or not settings.openai_api_key:
            return None
        try:
            from openai import OpenAI
            _client = OpenAI(api_key=settings.openai_api_key)
        except Exception as exc:
            logger.error("Failed to initialize OpenAI client: %s", exc)
            return None
    return _client


def summarize_signal(title: str, snippet: str | None, source: str) -> Optional[str]:
    """Generate a concise 2-3 sentence summary of an OSINT signal."""
    client = _get_client()
    if not client:
        return None

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a cybersecurity analyst. Summarize the following OSINT signal "
                        "in 2-3 concise sentences. Focus on: what happened, who is affected, "
                        "and potential impact. Be factual and avoid speculation."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Source: {source}\nTitle: {title}\nContent: {snippet or 'N/A'}",
                },
            ],
            max_tokens=200,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.error("AI summarization failed: %s", exc)
        return None


def analyze_signals(signals_data: List[dict]) -> Optional[dict]:
    """Perform AI analysis across multiple signals to identify patterns.

    Returns dict with: analysis, threat_level, key_entities, recommended_actions
    """
    client = _get_client()
    if not client:
        return None

    # Build a compact representation of signals for the prompt
    signal_descriptions = []
    for i, sig in enumerate(signals_data[:20], 1):  # cap at 20 for token limits
        signal_descriptions.append(
            f"{i}. [{sig.get('source', 'unknown')}] {sig.get('title', '')} "
            f"(severity: {sig.get('severity', 0)})"
        )

    signals_text = "\n".join(signal_descriptions)

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a senior cybersecurity threat analyst. Analyze the following "
                        "collection of OSINT signals and provide:\n"
                        "1. A brief overall analysis (2-3 paragraphs)\n"
                        "2. An overall threat level (low/medium/high/critical)\n"
                        "3. Key entities mentioned (organizations, threat actors, CVEs, etc.)\n"
                        "4. Recommended actions for a security team\n\n"
                        "Respond in valid JSON with keys: analysis, threat_level, key_entities (array), "
                        "recommended_actions (array)."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Current OSINT signals:\n{signals_text}",
                },
            ],
            max_tokens=800,
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        return {
            "analysis": result.get("analysis", ""),
            "threat_level": result.get("threat_level", "medium"),
            "key_entities": result.get("key_entities", []),
            "recommended_actions": result.get("recommended_actions", []),
        }
    except Exception as exc:
        logger.error("AI analysis failed: %s", exc)
        return None


def generate_fallback_summary(title: str, snippet: str | None) -> str:
    """Generate a basic extractive summary without AI (always available)."""
    text = snippet or title
    # Take first 2 sentences as a summary
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
    summary = ". ".join(sentences[:2])
    if summary and not summary.endswith("."):
        summary += "."
    return summary[:500] if summary else title[:200]
