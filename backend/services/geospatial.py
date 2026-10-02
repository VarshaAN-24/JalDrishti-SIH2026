import math
from shapely.geometry import Point, Polygon, LineString
import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "jaldrishti.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def haversine_distance_m(lat1, lon1, lat2, lon2):
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_containing_subwatershed(lat, lng):
    """
    Checks if coordinates fall strictly inside a surveyed sub-watershed polygon.
    Returns None if the coordinate is outside all known polygons (Data Honesty).
    """
    if lat is None or lng is None:
        return None
    point = Point(lng, lat)
    conn = get_db()
    rows = conn.execute("SELECT id, name, priority, slope, soil_type, runoff_coeff, geojson FROM sub_watersheds").fetchall()
    conn.close()
    
    for row in rows:
        geom = json.loads(row["geojson"])
        poly = Polygon(geom["coordinates"][0])
        if poly.contains(point):
            return {
                "id": row["id"],
                "name": row["name"],
                "priority": row["priority"],
                "slope": row["slope"],
                "soil_type": row["soil_type"],
                "runoff_coeff": row["runoff_coeff"]
            }
            
    # Honest response: do not invent/fallback to a pilot zone if outside the polygon
    return None

def find_nearest_drainage_stream(lat, lng, max_dist_m=5000):
    """
    Finds nearest drainage reach within max_dist_m (default 5 km).
    Returns None if no drainage stream exists within physical proximity.
    """
    if lat is None or lng is None:
        return None
    conn = get_db()
    rows = conn.execute("SELECT id, name, stream_order, geojson FROM drainage_network").fetchall()
    conn.close()
    
    min_dist = float("inf")
    nearest_stream = None
    
    for row in rows:
        geom = json.loads(row["geojson"])
        coords = geom["coordinates"]
        for pt in coords:
            dist = haversine_distance_m(lat, lng, pt[1], pt[0])
            if dist < min_dist:
                min_dist = dist
                nearest_stream = {
                    "id": row["id"],
                    "name": row["name"],
                    "stream_order": row["stream_order"],
                    "distance_m": round(min_dist, 1)
                }
    
    if min_dist <= max_dist_m:
        return nearest_stream
    return None

def find_nearest_waterbody(lat, lng, max_dist_m=5000):
    """
    Finds nearest water body within max_dist_m (default 5 km).
    Returns None if no water body exists within physical proximity.
    """
    if lat is None or lng is None:
        return None
    conn = get_db()
    rows = conn.execute("SELECT id, name, type, capacity_tcm, current_fill_pct, siltation_level, geojson FROM water_bodies").fetchall()
    conn.close()
    
    min_dist = float("inf")
    nearest_wb = None
    
    for row in rows:
        geom = json.loads(row["geojson"])
        coords = geom["coordinates"][0]
        for pt in coords:
            dist = haversine_distance_m(lat, lng, pt[1], pt[0])
            if dist < min_dist:
                min_dist = dist
                nearest_wb = {
                    "id": row["id"],
                    "name": row["name"],
                    "type": row["type"],
                    "capacity_tcm": row["capacity_tcm"],
                    "fill_pct": row["current_fill_pct"],
                    "siltation_level": row["siltation_level"],
                    "distance_m": round(min_dist, 1)
                }
                
    if min_dist <= max_dist_m:
        return nearest_wb
    return None
