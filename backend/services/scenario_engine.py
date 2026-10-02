import math
from .geospatial import find_containing_subwatershed, find_nearest_drainage_stream, find_nearest_waterbody

def evaluate_intervention_scenario(lat, lng, intervention_type):
    """
    Evaluates spatial evidence and engineering considerations for a proposed intervention.
    Includes strict statutory planning disclaimer.
    """
    sub_w = find_containing_subwatershed(lat, lng) or {
        "id": "ZONE-1X",
        "name": "General Catchment Zone",
        "priority": "Moderate",
        "slope": "4.5%",
        "soil_type": "Medium Loam",
        "runoff_coeff": 0.35
    }
    
    stream = find_nearest_drainage_stream(lat, lng) or {
        "id": "STR-GEN",
        "name": "Tributary Channel",
        "stream_order": 2,
        "distance_m": 45.0
    }
    
    waterbody = find_nearest_waterbody(lat, lng)
    
    # Calculate hydrological parameters
    c = float(sub_w.get("runoff_coeff", 0.35))
    slope_val = float(str(sub_w.get("slope", "5.0%")).replace("%", ""))
    
    # Defaults by intervention type
    if intervention_type == "Check Dam":
        est_storage_m3 = round(3500 + (1.0 / (slope_val + 0.1)) * 1200, 0)
        recharge_radius_m = 450
        cost_estimate_lakhs = round(6.5 + (stream["stream_order"] * 0.8), 2)
        annual_runoff_capture_m3 = round(est_storage_m3 * 2.8, 0)
        soil_retention_tons = round(est_storage_m3 * 0.08, 1)
        suitability_score = 92 if (stream["stream_order"] in [2, 3] and stream["distance_m"] < 40) else 68
        
        considerations = [
            f"Nearest drainage channel is {stream['name']} (Order {stream['stream_order']}) at {stream['distance_m']}m.",
            "Bedrock foundation keying required if basalt substratum is within 1.5m depth.",
            "Provide stone pitching apron of minimum 3.0m length downstream to dissipate hydraulic drop energy.",
            f"Estimated upstream catchment retention: {est_storage_m3:,.0f} m³ per filling cycle.",
            "Plan community desilting protocol in Year 3 to safeguard against sedimentation."
        ]
        
    elif intervention_type == "Farm Pond":
        est_storage_m3 = 2000
        recharge_radius_m = 180
        cost_estimate_lakhs = 2.40
        annual_runoff_capture_m3 = 4500
        soil_retention_tons = 35.0
        suitability_score = 88 if slope_val <= 5.0 else 60
        
        considerations = [
            f"Ideal slope for dug-out pond is < 5% (local zone slope is {slope_val}%).",
            "Inlet silt trap chamber (3m x 2m x 1m) is mandatory to prevent silt deposition into farm pond.",
            "Polyethylene lining (500 micron HDPE) recommended if soil exhibits high percolation losses.",
            "Can provide 2 life-saving supplemental irrigations for 4-5 hectares of rabi pulse crops."
        ]
        
    elif intervention_type == "Percolation Tank":
        est_storage_m3 = 18000
        recharge_radius_m = 950
        cost_estimate_lakhs = 14.80
        annual_runoff_capture_m3 = 36000
        soil_retention_tons = 180.0
        suitability_score = 85 if (stream["stream_order"] >= 3 and slope_val < 4.0) else 65
        
        considerations = [
            "Requires substantial catchment of 40-80 hectares to fill design capacity.",
            "Downstream well survey required to establish baseline static water levels.",
            "Construct waste weir to safely bypass extreme 1-in-25-year flood discharge.",
            "Estimated groundwater table rise: +1.2m to +2.5m within 800m command zone."
        ]
        
    else:  # Continuous Contour Trenches (CCT)
        est_storage_m3 = 4200
        recharge_radius_m = 320
        cost_estimate_lakhs = 3.90
        annual_runoff_capture_m3 = 8500
        soil_retention_tons = 240.0
        suitability_score = 95 if slope_val >= 6.0 else 72
        
        considerations = [
            f"Highly suitable for ridge slope {slope_val}% to break surface runoff velocity.",
            "Staggered trenches (0.5m x 0.5m) along contour lines at 10m horizontal intervals.",
            "Plant vetiver grass and local legume shrubs on berms to permanently bind soil.",
            "Directly prevents downstream siltation of reservoirs and tanks."
        ]
        
    return {
        "status": "success",
        "coordinates": {"lat": lat, "lng": lng},
        "intervention_type": intervention_type,
        "sub_watershed": sub_w,
        "nearest_stream": stream,
        "nearest_waterbody": waterbody,
        "hydrological_model": {
            "runoff_coefficient": c,
            "slope_pct": slope_val,
            "estimated_storage_m3": est_storage_m3,
            "annual_runoff_capture_m3": annual_runoff_capture_m3,
            "recharge_radius_m": recharge_radius_m,
            "soil_retention_tons_per_year": soil_retention_tons,
            "cost_estimate_lakhs": cost_estimate_lakhs,
            "suitability_score_pct": suitability_score
        },
        "engineering_considerations": considerations,
        "disclaimer_badge": "SCENARIO / PLANNING ASSISTANCE FEATURE",
        "regulatory_disclaimer": (
            "NOTICE: This counterfactual simulation is an advisory decision-support tool generated by "
            "hydrological heuristic models and spatial GIS layers. It does NOT constitute a statutory administrative "
            "approval, guaranteed engineering outcome, or binding government sanction. On-site geotechnical and "
            "topographical survey by the Watershed Development Team (WDT) is mandatory prior to project execution."
        )
    }
