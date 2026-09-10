from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Batch
from app.services.batch_service import BatchService
from app.risk_engine.risk_scorer import RiskScorer
from app.risk_engine.explanations import ExplanationGenerator

class InvestigationAssistant:
    """
    Deterministic Natural Language Query Helper for compliance investigators.
    Parses questions about batch numbers or general risk stats and responds with exact DB evidence.
    """
    @staticmethod
    def answer_query(question: str, batch_id: Optional[int], db: Session) -> Dict[str, Any]:
        q_upper = question.upper()
        
        # Check if question mentions a specific batch number like P7788, P1001, C2045, A4421
        target_batch = None
        if batch_id:
            target_batch = db.query(Batch).filter(Batch.id == batch_id).first()
        else:
            for b in db.query(Batch).all():
                if b.batch_number.upper() in q_upper:
                    target_batch = b
                    break

        if target_batch:
            enriched = BatchService.enrich_batch_dict(target_batch, db)
            reasons = enriched["suspicious_reasons"]
            
            bullet_points = "\n".join([f"• {r}" for r in reasons])
            
            response_text = (
                f"### Analysis for Batch {target_batch.batch_number} ({enriched['product_name']})\n\n"
                f"**Risk Score**: `{enriched['risk_score']} / 100` ({enriched['risk_level']})\n"
                f"**Current Status**: `{enriched['status']}`\n"
                f"**Location**: {enriched['current_location_city']} ({enriched['current_owner_name']})\n\n"
                f"#### Identified Risk Signals:\n{bullet_points}\n\n"
                f"**Recommended Action**: {enriched['alerts'][0]['recommended_action'] if enriched['alerts'] else 'Proceed with standard audit.'}"
            )

            return {
                "batch_id": target_batch.id,
                "batch_number": target_batch.batch_number,
                "risk_score": enriched["risk_score"],
                "answer": response_text,
                "reasons": reasons
            }

        # General summary query
        high_risk_count = db.query(Batch).filter(Batch.risk_score >= 50).count()
        total_batches = db.query(Batch).count()
        reentry_alerts = db.query(Batch).filter(Batch.risk_score >= 75).count()

        summary_text = (
            f"### Central Compliance Overview\n\n"
            f"• **Total Tracked Batches**: {total_batches}\n"
            f"• **High / Critical Risk Batches**: {high_risk_count}\n"
            f"• **Critical Fraud / Re-entry Alerts**: {reentry_alerts}\n\n"
            f"To inspect a specific batch, ask: *'Why is Batch P7788 suspicious?'* or select any batch from the queue."
        )

        return {
            "batch_id": None,
            "batch_number": None,
            "risk_score": None,
            "answer": summary_text,
            "reasons": []
        }
