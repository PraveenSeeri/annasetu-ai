from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import (
    auth,
    users,
    organizations,
    verifications,
    listings,
    donations,
    matching,
    pickups,
    notifications,
    ai,
    impact,
    admin
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Surplus Food Redistribution Platform connecting food donors, verified recipients, and volunteers with AI coordination.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(verifications.router)
app.include_router(listings.router)
app.include_router(donations.router)
app.include_router(matching.router)
app.include_router(pickups.router)
app.include_router(notifications.router)
app.include_router(ai.router)
app.include_router(impact.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Share More. Waste Less. Feed Hope.",
        "status": "operational",
        "documentation": "/api/docs",
        "health_check": "/api/health"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_enabled": bool(settings.GEMINI_API_KEY)
    }
