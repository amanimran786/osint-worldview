"""Seed the database with default sources and rules."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import SessionLocal
from app.models.entities import Source, Rule

DEFAULT_SOURCES = [
    {"name": "US-CERT Alerts", "type": "rss", "url": "https://www.cisa.gov/uscert/ncas/alerts.xml"},
    {"name": "Krebs on Security", "type": "rss", "url": "https://krebsonsecurity.com/feed/"},
    {"name": "BleepingComputer", "type": "rss", "url": "https://www.bleepingcomputer.com/feed/"},
    {"name": "The Hacker News", "type": "rss", "url": "https://feeds.feedburner.com/TheHackersNews"},
    {"name": "Dark Reading", "type": "rss", "url": "https://www.darkreading.com/rss.xml"},
]

DEFAULT_RULES = [
    {
        "name": "Ransomware Mention",
        "category": "malware",
        "severity": 30,
        "keywords": "ransomware,ransom,lockbit,blackcat,alphv",
        "enabled": True,
    },
    {
        "name": "Critical CVE",
        "category": "vulnerability",
        "severity": 25,
        "keywords": "critical vulnerability,zero-day,0-day,CVE-2024,CVE-2025",
        "enabled": True,
    },
    {
        "name": "Data Breach",
        "category": "breach",
        "severity": 20,
        "keywords": "data breach,data leak,leaked credentials,exposed database",
        "enabled": True,
    },
    {
        "name": "Phishing Campaign",
        "category": "phishing",
        "severity": 15,
        "keywords": "phishing,spear-phishing,credential harvesting,business email compromise",
        "enabled": True,
    },
    {
        "name": "Nation-State Activity",
        "category": "apt",
        "severity": 35,
        "keywords": "APT,nation-state,state-sponsored,Lazarus,Fancy Bear,Cozy Bear",
        "enabled": True,
    },
]


def seed():
    db = SessionLocal()
    try:
        # Sources
        existing_sources = {s.url for s in db.query(Source).all()}
        added_sources = 0
        for src in DEFAULT_SOURCES:
            if src["url"] not in existing_sources:
                db.add(Source(**src))
                added_sources += 1

        # Rules
        existing_rules = {r.name for r in db.query(Rule).all()}
        added_rules = 0
        for rule in DEFAULT_RULES:
            if rule["name"] not in existing_rules:
                db.add(Rule(**rule))
                added_rules += 1

        db.commit()
        print(f"Seeded {added_sources} sources and {added_rules} rules.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
