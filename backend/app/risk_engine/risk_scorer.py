from typing import Dict, Any, Tuple, List
from app.models.models import Batch
from app.risk_engine.anomaly_detector import AnomalyDetector

class RiskScorer:
    """
    Computes 0-100 risk score and categorical band for a pharmaceutical batch digital twin.
    """
    @staticmethod
    def calculate_risk(batch: Batch) -> Tuple[int, str, List[Dict[str, Any]]]:
        anomalies = AnomalyDetector.detect_anomalies(batch)
        
        total_points = sum(item["points"] for item in anomalies)
        score = min(total_points, 100)

        if score >= 75:
            level = "CRITICAL"
        elif score >= 50:
            level = "HIGH"
        elif score >= 25:
            level = "MEDIUM"
        else:
            level = "LOW"

        return score, level, anomalies
