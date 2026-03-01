import hashlib
from typing import List


class ScoringResult:
    __slots__ = ("score", "explanations", "triggered_rules")

    def __init__(self, score: int, explanations: List[str], triggered_rules: List[int]):
        self.score = score
        self.explanations = explanations
        self.triggered_rules = triggered_rules


def canonical_key(url: str, title: str) -> str:
    return hashlib.sha256(f"{url.lower()}::{title.lower()}".encode()).hexdigest()


def _parse_csv(value: str | None) -> List[str]:
    """Split comma-separated string into stripped, lowered, non-empty tokens."""
    if not value:
        return []
    return [k.strip().lower() for k in value.split(",") if k.strip()]


def apply_rules(signal, rules) -> ScoringResult:
    score = 0
    explanations: List[str] = []
    triggered: List[int] = []
    title_lower = signal.title.lower()
    snippet_lower = (signal.snippet or "").lower()
    combined = f"{title_lower} {snippet_lower}"

    for rule in rules:
        if not rule.enabled:
            continue

        keywords = _parse_csv(rule.keywords)
        if not keywords:
            continue

        allow = _parse_csv(rule.allowlist)
        deny = _parse_csv(rule.denylist)

        # Allowlist: at least one must appear
        if allow and not any(k in combined for k in allow):
            continue
        # Denylist: none must appear
        if deny and any(k in combined for k in deny):
            continue
        # Keyword match
        if any(k in combined for k in keywords):
            score += rule.severity
            explanations.append(f"Rule '{rule.name}' matched: {', '.join(keywords[:3])}")
            triggered.append(rule.id)

    return ScoringResult(min(score, 100), explanations, triggered)
