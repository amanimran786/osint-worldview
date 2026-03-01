"""Data layer endpoints — live external feeds for map overlays.

Provides earthquake, cyber threat, and weather data from public APIs.
Each endpoint is designed to be fast (cached upstream) and map-ready.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/layers", tags=["layers"])

_HTTP_TIMEOUT = 10.0


# ------------------------------------------------------------------ Earthquakes
@router.get("/earthquakes")
async def get_earthquakes(
    min_magnitude: float = Query(4.0, ge=0, le=10),
    period: str = Query("day", regex="^(hour|day|week|month)$"),
):
    """Fetch recent earthquakes from USGS GeoJSON feed."""
    url_map = {
        "hour": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
        "day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
        "week": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
        "month": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
    }
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            resp = await client.get(url_map[period])
            resp.raise_for_status()
            data = resp.json()

        features = []
        for feat in data.get("features", []):
            props = feat.get("properties", {})
            coords = feat.get("geometry", {}).get("coordinates", [0, 0, 0])
            mag = props.get("mag", 0) or 0
            if mag < min_magnitude:
                continue
            features.append({
                "id": feat.get("id"),
                "title": props.get("title", ""),
                "magnitude": round(mag, 1),
                "latitude": coords[1],
                "longitude": coords[0],
                "depth_km": round(coords[2], 1) if len(coords) > 2 else None,
                "time": props.get("time"),
                "url": props.get("url"),
                "tsunami": props.get("tsunami", 0),
                "severity": (
                    "critical" if mag >= 7.0
                    else "high" if mag >= 5.5
                    else "medium" if mag >= 4.0
                    else "low"
                ),
            })

        return {
            "count": len(features),
            "period": period,
            "min_magnitude": min_magnitude,
            "features": features,
        }
    except Exception as e:
        logger.warning("Earthquake fetch failed: %s", e)
        return {"count": 0, "period": period, "min_magnitude": min_magnitude, "features": [], "error": str(e)}


# ------------------------------------------------------------------ Cyber Threats

# Approximate country-code → lat/lng for threat map placement
_COUNTRY_COORDS: dict[str, tuple[float, float]] = {
    "US": (39.8, -98.5), "GB": (54.0, -2.0), "DE": (51.2, 10.4),
    "FR": (46.6, 2.2), "NL": (52.1, 5.3), "RU": (61.5, 105.3),
    "CN": (35.9, 104.2), "JP": (36.2, 138.3), "KR": (35.9, 127.8),
    "IN": (20.6, 79.0), "BR": (-14.2, -51.9), "AU": (-25.3, 133.8),
    "CA": (56.1, -106.3), "ZA": (-30.6, 22.9), "SG": (1.35, 103.8),
    "UA": (48.4, 31.2), "PL": (51.9, 19.1), "IT": (41.9, 12.6),
    "ES": (40.5, -3.7), "SE": (60.1, 18.6), "TR": (39.0, 35.2),
    "ID": (-0.8, 113.9), "MX": (23.6, -102.6), "AR": (-38.4, -63.6),
    "EG": (26.8, 30.8), "NG": (9.1, 8.7), "TH": (15.9, 100.9),
    "VN": (14.1, 108.3), "PH": (12.9, 121.8), "CO": (4.6, -74.3),
    "MY": (4.2, 101.9), "CL": (-35.7, -71.5), "RO": (45.9, 25.0),
    "HK": (22.3, 114.2), "TW": (23.7, 120.96), "IR": (32.4, 53.7),
    "BD": (23.7, 90.4), "PK": (30.4, 69.3), "KE": (-0.02, 37.9),
    "CZ": (49.8, 15.5), "AT": (47.5, 14.6), "CH": (46.8, 8.2),
    "LT": (55.2, 23.9), "LV": (56.9, 24.1), "BG": (42.7, 25.5),
    "HU": (47.2, 19.5), "FI": (61.9, 25.7), "NO": (60.5, 8.5),
    "DK": (56.3, 9.5), "IE": (53.1, -7.7), "PT": (39.4, -8.2),
}


@router.get("/cyber-threats")
async def get_cyber_threats(limit: int = Query(100, le=500)):
    """Fetch recent C2 server IOCs from abuse.ch Feodo Tracker."""
    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            resp = await client.get("https://feodotracker.abuse.ch/downloads/ipblocklist.json")
            resp.raise_for_status()
            data = resp.json()

        threats = []
        for entry in data[:limit]:
            country = entry.get("country", "")
            coords = _COUNTRY_COORDS.get(country)
            if not coords:
                continue  # skip entries we cannot place on the map
            # Add small random-ish offset based on IP to spread markers
            ip = entry.get("ip_address", "")
            ip_hash = sum(int(b) for b in ip.split(".") if b.isdigit()) if ip else 0
            lat_offset = ((ip_hash % 100) - 50) * 0.04
            lng_offset = (((ip_hash * 7) % 100) - 50) * 0.04

            threats.append({
                "ip": ip,
                "port": entry.get("port"),
                "status": entry.get("status", "unknown"),
                "malware": entry.get("malware", "unknown"),
                "first_seen": entry.get("first_seen"),
                "last_online": entry.get("last_online"),
                "country": country,
                "latitude": round(coords[0] + lat_offset, 4),
                "longitude": round(coords[1] + lng_offset, 4),
            })

        return {"count": len(threats), "threats": threats}
    except Exception as e:
        logger.warning("Cyber threat fetch failed: %s", e)
        return {"count": 0, "threats": [], "error": str(e)}


# ------------------------------------------------------------------ Weather Alerts
@router.get("/weather")
async def get_weather_alerts():
    """Fetch severe weather from Open-Meteo for key global cities.

    Returns current conditions for 20 strategic cities — the frontend
    uses these to overlay weather icons on the map.
    """
    cities = [
        ("Washington DC", 38.90, -77.04),
        ("New York", 40.71, -74.01),
        ("London", 51.51, -0.13),
        ("Paris", 48.86, 2.35),
        ("Moscow", 55.76, 37.62),
        ("Beijing", 39.90, 116.40),
        ("Tokyo", 35.68, 139.69),
        ("Seoul", 37.57, 126.98),
        ("Tehran", 35.69, 51.39),
        ("Tel Aviv", 32.09, 34.78),
        ("Dubai", 25.20, 55.27),
        ("Mumbai", 19.08, 72.88),
        ("Sydney", -33.87, 151.21),
        ("Taipei", 25.03, 121.57),
        ("Kyiv", 50.45, 30.52),
        ("Berlin", 52.52, 13.41),
        ("São Paulo", -23.55, -46.63),
        ("Lagos", 6.52, 3.38),
        ("Singapore", 1.35, 103.82),
        ("Austin", 30.27, -97.74),
    ]

    lats = ",".join(str(c[1]) for c in cities)
    lons = ",".join(str(c[2]) for c in cities)

    try:
        async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lats,
                    "longitude": lons,
                    "current": "temperature_2m,wind_speed_10m,weather_code",
                    "timezone": "auto",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        # Open-Meteo returns an array when multiple coords are passed
        results = []
        entries = data if isinstance(data, list) else [data]
        for i, entry in enumerate(entries):
            current = entry.get("current", {})
            city_name = cities[i][0] if i < len(cities) else "Unknown"
            weather_code = current.get("weather_code", 0)
            results.append({
                "city": city_name,
                "latitude": cities[i][1] if i < len(cities) else 0,
                "longitude": cities[i][2] if i < len(cities) else 0,
                "temperature_c": current.get("temperature_2m"),
                "wind_speed_kmh": current.get("wind_speed_10m"),
                "weather_code": weather_code,
                "condition": _weather_condition(weather_code),
                "severity": _weather_severity(weather_code),
            })

        return {"count": len(results), "weather": results}
    except Exception as e:
        logger.warning("Weather fetch failed: %s", e)
        return {"count": 0, "weather": [], "error": str(e)}


# ------------------------------------------------------------------ GDACS Disasters
@router.get("/disasters")
async def get_disasters():
    """Fetch recent natural disaster alerts from GDACS RSS."""
    try:
        import feedparser
        feed = feedparser.parse("https://www.gdacs.org/xml/rss.xml")

        disasters = []
        for entry in feed.entries[:50]:
            lat = None
            lon = None
            # GDACS uses georss namespace
            if hasattr(entry, "geo_lat") and hasattr(entry, "geo_long"):
                lat = float(entry.geo_lat)
                lon = float(entry.geo_long)
            elif hasattr(entry, "where"):
                # Try to parse GeoRSS point
                try:
                    parts = entry.where.get("point", "").split()
                    if len(parts) == 2:
                        lat, lon = float(parts[0]), float(parts[1])
                except (ValueError, AttributeError):
                    pass

            disasters.append({
                "title": entry.get("title", ""),
                "description": entry.get("summary", "")[:300],
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "latitude": lat,
                "longitude": lon,
                "alert_level": entry.get("gdacs_alertlevel", "unknown"),
                "event_type": entry.get("gdacs_eventtype", "unknown"),
                "country": entry.get("gdacs_country", ""),
            })

        return {"count": len(disasters), "disasters": disasters}
    except Exception as e:
        logger.warning("Disaster feed fetch failed: %s", e)
        return {"count": 0, "disasters": [], "error": str(e)}


def _weather_condition(code: int) -> str:
    """Map WMO weather code to human-readable condition."""
    if code == 0:
        return "Clear"
    elif code <= 3:
        return "Cloudy"
    elif code <= 49:
        return "Fog"
    elif code <= 59:
        return "Drizzle"
    elif code <= 69:
        return "Rain"
    elif code <= 79:
        return "Snow"
    elif code <= 84:
        return "Rain Showers"
    elif code <= 86:
        return "Snow Showers"
    elif code <= 99:
        return "Thunderstorm"
    return "Unknown"


def _weather_severity(code: int) -> str:
    """Map WMO weather code to severity level."""
    if code >= 95:
        return "critical"
    elif code >= 80:
        return "high"
    elif code >= 60:
        return "medium"
    return "low"
