from typing import List
from app.models.models import Batch
from app.risk_engine.risk_scorer import RiskScorer

class ExplanationGenerator:
    """
    Generates deterministic human-readable explanations for "Why is this batch suspicious?".
    """
    @staticmethod
    def generate_explanation(batch: Batch) -> List[str]:
        score, level, anomalies = RiskScorer.calculate_risk(batch)
        
        if not anomalies:
            return ["No compliance anomalies detected. Batch lifecycle is normal."]

        reasons = []
        for anomaly in anomalies:
            reasons.append(f"{anomaly['title']}: {anomaly['description']}")

        return reasons
