"""Extract geographic locations from signal text and resolve to coordinates.

Uses a lightweight approach: extract city/country names from text,
then resolve them to lat/lon via a built-in lookup table of major cities.
Falls back to country centroids for country-only mentions.
"""
import logging
import re
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# ---- Major city coordinates (top cyber-relevant cities) ----
CITY_COORDS: dict[str, Tuple[float, float, str]] = {
    # city_lower: (lat, lon, country_code)
    "washington": (38.9072, -77.0369, "US"),
    "washington dc": (38.9072, -77.0369, "US"),
    "new york": (40.7128, -74.0060, "US"),
    "san francisco": (37.7749, -122.4194, "US"),
    "los angeles": (34.0522, -118.2437, "US"),
    "chicago": (41.8781, -87.6298, "US"),
    "seattle": (47.6062, -122.3321, "US"),
    "boston": (42.3601, -71.0589, "US"),
    "austin": (30.2672, -97.7431, "US"),
    "london": (51.5074, -0.1278, "GB"),
    "moscow": (55.7558, 37.6173, "RU"),
    "beijing": (39.9042, 116.4074, "CN"),
    "shanghai": (31.2304, 121.4737, "CN"),
    "tokyo": (35.6762, 139.6503, "JP"),
    "seoul": (37.5665, 126.9780, "KR"),
    "pyongyang": (39.0392, 125.7625, "KP"),
    "tehran": (35.6892, 51.3890, "IR"),
    "tel aviv": (32.0853, 34.7818, "IL"),
    "jerusalem": (31.7683, 35.2137, "IL"),
    "berlin": (52.5200, 13.4050, "DE"),
    "paris": (48.8566, 2.3522, "FR"),
    "singapore": (1.3521, 103.8198, "SG"),
    "taipei": (25.0330, 121.5654, "TW"),
    "mumbai": (19.0760, 72.8777, "IN"),
    "new delhi": (28.6139, 77.2090, "IN"),
    "bangalore": (12.9716, 77.5946, "IN"),
    "sydney": (33.8688, 151.2093, "AU"),
    "toronto": (43.6532, -79.3832, "CA"),
    "dubai": (25.2048, 55.2708, "AE"),
    "riyadh": (24.7136, 46.6753, "SA"),
    "brussels": (50.8503, 4.3517, "BE"),
    "kiev": (50.4501, 30.5234, "UA"),
    "kyiv": (50.4501, 30.5234, "UA"),
    "minsk": (53.9045, 27.5615, "BY"),
    "amsterdam": (52.3676, 4.9041, "NL"),
    "zürich": (47.3769, 8.5417, "CH"),
    "zurich": (47.3769, 8.5417, "CH"),
    "hong kong": (22.3193, 114.1694, "HK"),
    "islamabad": (33.6844, 73.0479, "PK"),
    "hanoi": (21.0285, 105.8542, "VN"),
    "bangkok": (13.7563, 100.5018, "TH"),
    "lagos": (6.5244, 3.3792, "NG"),
    "nairobi": (-1.2921, 36.8219, "KE"),
    "johannesburg": (-26.2041, 28.0473, "ZA"),
    "são paulo": (-23.5505, -46.6333, "BR"),
    "sao paulo": (-23.5505, -46.6333, "BR"),
    "mexico city": (19.4326, -99.1332, "MX"),
    "buenos aires": (-34.6037, -58.3816, "AR"),
    "tallinn": (59.4370, 24.7536, "EE"),
    "riga": (56.9496, 24.1052, "LV"),
    "vilnius": (54.6872, 25.2797, "LT"),
    "bucharest": (44.4268, 26.1025, "RO"),
    "warsaw": (52.2297, 21.0122, "PL"),
}

# ---- Country name → centroid + code ----
COUNTRY_COORDS: dict[str, Tuple[float, float, str]] = {
    "united states": (39.8283, -98.5795, "US"),
    "usa": (39.8283, -98.5795, "US"),
    "u.s.": (39.8283, -98.5795, "US"),
    "united kingdom": (55.3781, -3.4360, "GB"),
    "uk": (55.3781, -3.4360, "GB"),
    "britain": (55.3781, -3.4360, "GB"),
    "russia": (61.5240, 105.3188, "RU"),
    "china": (35.8617, 104.1954, "CN"),
    "japan": (36.2048, 138.2529, "JP"),
    "south korea": (35.9078, 127.7669, "KR"),
    "north korea": (40.3399, 127.5101, "KP"),
    "iran": (32.4279, 53.6880, "IR"),
    "israel": (31.0461, 34.8516, "IL"),
    "germany": (51.1657, 10.4515, "DE"),
    "france": (46.2276, 2.2137, "FR"),
    "india": (20.5937, 78.9629, "IN"),
    "australia": (-25.2744, 133.7751, "AU"),
    "canada": (56.1304, -106.3468, "CA"),
    "brazil": (-14.2350, -51.9253, "BR"),
    "ukraine": (48.3794, 31.1656, "UA"),
    "taiwan": (23.6978, 120.9605, "TW"),
    "pakistan": (30.3753, 69.3451, "PK"),
    "vietnam": (14.0583, 108.2772, "VN"),
    "nigeria": (9.0820, 8.6753, "NG"),
    "saudi arabia": (23.8859, 45.0792, "SA"),
    "poland": (51.9194, 19.1451, "PL"),
    "romania": (45.9432, 24.9668, "RO"),
    "netherlands": (52.1326, 5.2913, "NL"),
    "belgium": (50.5039, 4.4699, "BE"),
    "switzerland": (46.8182, 8.2275, "CH"),
    "singapore": (1.3521, 103.8198, "SG"),
    "mexico": (23.6345, -102.5528, "MX"),
    "argentina": (-38.4161, -63.6167, "AR"),
    "south africa": (-30.5595, 22.9375, "ZA"),
    "kenya": (-0.0236, 37.9062, "KE"),
    "estonia": (58.5953, 25.0136, "EE"),
    "latvia": (56.8796, 24.6032, "LV"),
    "lithuania": (55.1694, 23.8813, "LT"),
    "belarus": (53.7098, 27.9534, "BY"),
    "uae": (23.4241, 53.8478, "AE"),
    "united arab emirates": (23.4241, 53.8478, "AE"),
}


def extract_location(title: str, snippet: str | None = None) -> Optional[dict]:
    """Extract the most relevant geographic location from signal text.

    Returns dict with keys: latitude, longitude, location_name, country_code
    or None if no location could be determined.
    """
    text = f"{title} {snippet or ''}".lower()

    # 1. Try city-level match (most specific)
    best_city = None
    best_pos = len(text) + 1
    for city, (lat, lon, cc) in CITY_COORDS.items():
        # word-boundary match to avoid partial matches
        pattern = r'\b' + re.escape(city) + r'\b'
        match = re.search(pattern, text)
        if match and match.start() < best_pos:
            best_pos = match.start()
            best_city = (city.title(), lat, lon, cc)

    if best_city:
        name, lat, lon, cc = best_city
        return {
            "latitude": lat,
            "longitude": lon,
            "location_name": name,
            "country_code": cc,
        }

    # 2. Try country-level match
    best_country = None
    best_pos = len(text) + 1
    for country, (lat, lon, cc) in COUNTRY_COORDS.items():
        pattern = r'\b' + re.escape(country) + r'\b'
        match = re.search(pattern, text)
        if match and match.start() < best_pos:
            best_pos = match.start()
            best_country = (country.title(), lat, lon, cc)

    if best_country:
        name, lat, lon, cc = best_country
        return {
            "latitude": lat,
            "longitude": lon,
            "location_name": name,
            "country_code": cc,
        }

    return None
