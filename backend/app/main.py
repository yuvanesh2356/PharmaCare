from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, batches, returns, handoffs, destruction, alerts, investigations, analytics, demo
from app.seed import seed_db

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PharmaChain AI — Reverse Chain Compliance & Fraud Intelligence API",
    description="CDSCO 2025 reverse drug supply chain tracking, batch digital twins, anomaly risk engine, and re-entry fraud detection.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(returns.router)
app.include_router(handoffs.router)
app.include_router(destruction.router)
app.include_router(alerts.router)
app.include_router(investigations.router)
app.include_router(analytics.router)
app.include_router(demo.router)

@app.on_event("startup")
def startup_event():
    # Seed DB on startup if empty
    try:
        from app.database import SessionLocal
        from app.models.models import Batch
        db = SessionLocal()
        if db.query(Batch).count() == 0:
            print("Database empty on startup. Running initial seed...")
            seed_db()
        db.close()
    except Exception as e:
        print(f"Startup DB check error: {e}")

@app.get("/")
def root():
    return {
        "platform": "PharmaChain AI",
        "status": "ONLINE",
        "compliance_mandate": "CDSCO 2025 Reverse Logistics",
        "docs_url": "/docs"
    }
