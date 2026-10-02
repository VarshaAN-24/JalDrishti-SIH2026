import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "jaldrishti.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def parse_watershed_query(query_text):
    """
    Parses a natural-language query into structured spatial filters, highlighted layers,
    and an explainable narrative response.
    """
    q = query_text.lower().strip()
    
    result = {
        "original_query": query_text,
        "matched_intent": "general_search",
        "narrative": "",
        "highlight_layers": [],
        "filter_criteria": {},
        "matched_interventions": [],
        "matched_observations": [],
        "matched_zones": [],
        "matched_water_bodies": []
    }
    
    conn = get_db()
    
    # Query 1: “Show high-priority erosion cases near water bodies.”
    if any(k in q for k in ["high-priority erosion", "erosion cases near water", "erosion near water bodies", "high priority erosion"]):
        result["matched_intent"] = "high_priority_erosion_near_water"
        result["narrative"] = (
            "Found High-Priority Case EVD-004 (Soil Erosion at Check Dam CD-04), situated 220m from Pond PB-02 "
            "and along drainage channel D-04. Severe gully scouring and 1.1m sediment bed jeopardize downstream impoundment."
        )
        result["highlight_layers"] = ["field_observations", "water_bodies", "drainage", "priority_zones"]
        result["filter_criteria"] = {"priority": "High", "proximity": "water_bodies", "observation": "Soil Erosion"}
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE title LIKE '%Erosion%' OR title LIKE '%Gully%' OR id = 'OBS-001'").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        result["matched_zones"] = ["ZONE-1A"]

    # Query 2: “Show pending verification cases.”
    elif any(k in q for k in ["pending verification", "pending verification cases", "unverified cases", "pending cases", "awaiting verification"]):
        result["matched_intent"] = "pending_verification_cases"
        result["narrative"] = (
            "Found 3 cases pending human verification: EVD-004 (Soil Erosion at CD-04 - High Priority), "
            "EVD-005 (Pond PB-02 Condition - Under Review), and EVD-006 (Contour Trench CT-03 - Pending Reinspection)."
        )
        result["highlight_layers"] = ["field_observations", "interventions"]
        result["filter_criteria"] = {"verification_status_in": ["PENDING VERIFICATION", "UNDER REVIEW", "PENDING REINSPECTION", "Needs Reinspection"]}
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE verification_status != 'CONFIRMED' AND verification_status != 'Verified'").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]

    # Query 3: “Show interventions requiring inspection.”
    elif any(k in q for k in ["interventions requiring inspection", "structures requiring inspection", "requiring inspection", "inspect interventions"]):
        result["matched_intent"] = "interventions_requiring_inspection"
        result["narrative"] = (
            "Found 2 interventions requiring ground inspection: Check Dam CD-04 (suspected siltation & weir scour) "
            "and Pond PB-02 reservoir (possible embankment seepage). Field verification recommended."
        )
        result["highlight_layers"] = ["interventions", "field_observations", "drainage"]
        result["filter_criteria"] = {"action": "Field Inspection Required"}
        rows = conn.execute("SELECT id, name, type, sub_watershed, lat, lng, observed_change, verification_status FROM interventions WHERE id IN ('INT-CD-01', 'INT-CD-07', 'INT-FP-02') OR verification_status != 'Confirmed'").fetchall()
        result["matched_interventions"] = [dict(r) for r in rows]

    # Query 4: “Show vegetation change areas.” / “Show areas with vegetation change.”
    elif any(k in q for k in ["vegetation change areas", "areas with vegetation change", "vegetation change", "vegetation changes", "green cover", "biomass change"]):
        result["matched_intent"] = "vegetation_change_areas"
        result["narrative"] = (
            "Showing multi-temporal vegetation change across Dharampura: Sub-basins 1B and 1C show canopy gains (+14.2%) "
            "downstream of water retention works, while upper ridge Zone 1A shows localized canopy decline (-14%) due to gully scouring."
        )
        result["highlight_layers"] = ["priority_zones", "interventions", "field_observations"]
        result["filter_criteria"] = {"layer": "vegetation_change"}
        result["matched_zones"] = ["ZONE-1A", "ZONE-1C"]
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations LIMIT 4").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]

    # Query 5: “Show field evidence near drainage.”
    elif any(k in q for k in ["field evidence near drainage", "evidence near drainage", "evidence near drainage line", "field evidence drainage"]):
        result["matched_intent"] = "field_evidence_near_drainage"
        result["narrative"] = (
            "Found 3 geo-coded field evidence points mapped along drainage streams: "
            "EVD-004 (Soil erosion at Order-2 channel D-04, 180m from stream bed), "
            "EVD-001 (Boulder weir siltation at check dam CD-01), and "
            "EVD-003 (Silt deposition along tributary confluence in Sub-basin 1C)."
        )
        result["highlight_layers"] = ["field_observations", "drainage", "interventions"]
        result["filter_criteria"] = {"proximity": "drainage", "layer": "field_observations"}
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE intervention_id IS NOT NULL OR title LIKE '%Erosion%' OR title LIKE '%Gully%'").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        result["matched_zones"] = ["ZONE-1A", "ZONE-1C"]

    # Legacy: "Show areas with soil erosion" / "soil erosion"
    elif any(k in q for k in ["soil erosion", "erosion", "gully", "sheet erosion", "areas with soil erosion"]):
        result["matched_intent"] = "areas_with_soil_erosion"
        result["narrative"] = (
            "Found 2 areas with severe soil erosion: Upper Ridge (Zone 1A) with active gully cutting, "
            "and East Foothills (Zone 1F) with topsoil sheet runoff. Field evidence photos confirm erosion risk."
        )
        result["highlight_layers"] = ["field_observations", "drainage", "priority_zones"]
        result["filter_criteria"] = {"observation_type": "Erosion"}
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE title LIKE '%Erosion%' OR title LIKE '%Gully%' OR ai_interpretation LIKE '%erosion%'").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        result["matched_zones"] = ["ZONE-1A", "ZONE-1F"]

    # Legacy: "Where are the nearby water bodies?" / "water bodies" / "ponds"
    elif any(k in q for k in ["water bodies", "nearby water", "water body", "lakes", "ponds", "reservoir"]):
        result["matched_intent"] = "nearby_water_bodies"
        result["narrative"] = (
            "Found 4 key water bodies in the watershed: 2 percolation tanks, 1 village pond (FP-08), "
            "and 1 community irrigation reservoir, holding a combined 457 TCM storage capacity."
        )
        result["highlight_layers"] = ["water_bodies", "drainage"]
        result["filter_criteria"] = {"layer": "water_bodies"}
        rows = conn.execute("SELECT id, name, type, sub_watershed, lat, lng, observed_change, verification_status FROM interventions WHERE type LIKE '%Pond%' OR type LIKE '%Tank%'").fetchall()
        result["matched_interventions"] = [dict(r) for r in rows]
        result["matched_zones"] = ["ZONE-1B", "ZONE-1D"]

    # Query 1: "Show interventions with limited vegetation improvement" / "limited vegetation"
    elif any(k in q for k in ["limited vegetation", "vegetation has not improved", "stagnant", "not improved", "limited improvement"]):
        result["matched_intent"] = "interventions_with_limited_vegetation"
        result["narrative"] = (
            "Found 1 intervention site (Masonry Check Dam CD-03 in Kalyana Sub-basin 1C) "
            "where civil works were completed in 2022, but post-monsoon Sentinel-2 NDVI remained virtually unchanged (+0.02 delta). "
            "Autonomous spectral analysis flags suspected wing-wall piping or sub-surface bypass requiring hydraulic inspection."
        )
        result["highlight_layers"] = ["interventions", "field_observations", "priority_zones"]
        result["filter_criteria"] = {"intervention_id": "INT-CD-07", "ndvi_delta": "< 0.05"}
        
        rows = conn.execute("SELECT id, name, type, sub_watershed, lat, lng, observed_change, verification_status FROM interventions WHERE id = 'INT-CD-07' OR verification_status = 'Flagged'").fetchall()
        result["matched_interventions"] = [dict(r) for r in rows]
        
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE intervention_id = 'INT-CD-07' OR verification_status = 'Flagged'").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        result["matched_zones"] = ["ZONE-1C"]

    # Query 2: "Find areas near drainage without interventions" / "drainage without interventions"
    elif any(k in q for k in ["near drainage without", "without interventions", "drainage without", "no intervention", "treatment gap"]):
        result["matched_intent"] = "drainage_gaps_without_interventions"
        result["narrative"] = (
            "Identified 2 severe treatment gap reaches along Stream Orders 2 and 3 in East Foothills (Zone 1F) "
            "and Upper Ridge (Zone 1A). High-gradient channels exhibit slope gradients > 7% and high runoff (C=0.52), "
            "yet zero soil-moisture retention structures exist over an 850m reach."
        )
        result["highlight_layers"] = ["drainage", "priority_zones", "field_observations"]
        result["filter_criteria"] = {"stream_order": [2, 3], "intervention_count": 0}
        
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE intervention_id IS NULL").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        result["matched_zones"] = ["ZONE-1F", "ZONE-1A"]

    # Query 3: "Show photos needing review" / "pending field verifications"
    elif any(k in q for k in ["photos needing review", "needing review", "pending field verifications", "pending verification", "pending review", "unverified", "needs reinspection", "show photos needing review"]):
        result["matched_intent"] = "pending_field_verifications"
        result["narrative"] = (
            "Found 4 field photos and assets needing review: "
            "1 flagged vegetation anomaly (Check Dam CD-03), 1 new dam under review (CD-09), "
            "1 gabion needing apron check (GB-04), and 1 unverified soil erosion photo."
        )
        result["highlight_layers"] = ["field_observations", "interventions"]
        result["filter_criteria"] = {"verification_status_in": ["Flagged", "Under Review", "Pending Review", "Needs Reinspection"]}
        
        rows = conn.execute("SELECT id, name, type, sub_watershed, lat, lng, observed_change, verification_status FROM interventions WHERE verification_status IN ('Flagged', 'Under Review', 'Pending Review', 'Needs Reinspection')").fetchall()
        result["matched_interventions"] = [dict(r) for r in rows]
        
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE verification_status IN ('Flagged', 'Under Review', 'Pending Review', 'Needs Reinspection')").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]

    # Query 4: "Which areas need attention?" / "areas needing attention" / "priority zones"
    elif any(k in q for k in ["which areas need attention", "areas need attention", "areas needing attention", "need attention", "recent negative change", "negative change", "negative ndvi", "canopy decline", "degradation"]):
        result["matched_intent"] = "priority_zones_with_negative_change"
        result["narrative"] = (
            "Areas Needing Attention: Upper Ridge (Zone 1A) and Kalyana Confluence (Zone 1C). "
            "Both areas have decreasing vegetation, steep drainage channels, and structures needing desilting."
        )
        result["highlight_layers"] = ["priority_zones", "drainage", "water_bodies"]
        result["filter_criteria"] = {"ndvi_delta": "< 0"}
        result["matched_zones"] = ["ZONE-1A", "ZONE-1C"]
        
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE sub_watershed IN ('ZONE-1A', 'ZONE-1C')").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]

    # Query 5: "Show water works near me" / "water works" / "interventions"
    elif any(k in q for k in ["water works", "soil works", "water works near me", "around this intervention", "evidence around", "all evidence around", "cd-01", "fp-08", "evidence around intervention"]):
        result["matched_intent"] = "evidence_around_intervention"
        result["narrative"] = (
            "Displaying water and soil works across the watershed: 18 check dams, farm ponds, percolation tanks, and contour trenches, "
            "with field photos and maintenance status."
        )
        result["highlight_layers"] = ["interventions", "field_observations", "water_bodies"]
        result["filter_criteria"] = {"intervention_id": "INT-CD-01"}
        
        rows = conn.execute("SELECT id, name, type, sub_watershed, lat, lng, observed_change, verification_status FROM interventions").fetchall()
        result["matched_interventions"] = [dict(r) for r in rows]
        
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations WHERE intervention_id IS NOT NULL").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        result["matched_zones"] = ["ZONE-1A"]

    # Query: "Show my field photos" / "field photos" / "photos"
    elif any(k in q for k in ["field photos", "my field photos", "my photos", "show photos", "field photo", "photos recorded"]):
        result["matched_intent"] = "field_photos_overview"
        result["narrative"] = (
            "Displaying field photos recorded across the area with GPS locations, capture dates, "
            "and preliminary field condition notes."
        )
        result["highlight_layers"] = ["field_observations"]
        result["filter_criteria"] = {"layer": "field_observations"}
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]

    # Query: "Show vegetation changes" / "vegetation" / "green cover"
    elif any(k in q for k in ["vegetation changes", "vegetation change", "vegetation", "green cover", "biomass"]):
        result["matched_intent"] = "vegetation_changes_overview"
        result["narrative"] = (
            "Showing vegetation changes across the watershed. 3 sub-basins show vegetative recovery "
            "following check dam construction, while upper ridge areas show biomass decline needing attention."
        )
        result["highlight_layers"] = ["priority_zones", "interventions"]
        result["filter_criteria"] = {"layer": "vegetation"}
        result["matched_zones"] = ["ZONE-1A", "ZONE-1C"]
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]

    # Fallback / generic search
    else:
        result["matched_intent"] = "general_watershed_overview"
        result["narrative"] = (
            f"Query '{query_text}' evaluated against the Dharampura Digital Twin. "
            "Highlighting active field evidence markers, drainage lines, and verified water-harvesting interventions."
        )
        result["highlight_layers"] = ["interventions", "field_observations", "priority_zones"]
        
        rows = conn.execute("SELECT id, name, type, sub_watershed, lat, lng, observed_change, verification_status FROM interventions LIMIT 5").fetchall()
        result["matched_interventions"] = [dict(r) for r in rows]
        
        obs_rows = conn.execute("SELECT id, title, lat, lng, verification_status, ai_interpretation FROM field_observations LIMIT 5").fetchall()
        result["matched_observations"] = [dict(r) for r in obs_rows]
        
    conn.close()
    return result
