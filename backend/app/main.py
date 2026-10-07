from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app import models
from app.routers import listings, bookings, auth, reviews
from app.seed import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    # Auto-seed if database is empty (e.g. on Render first boot)
    db = SessionLocal()
    try:
        if db.query(models.Listing).count() == 0:
            print("Database is empty. Auto-seeding listings and demo user...")
            seed_db()
    except Exception as e:
        print("Startup seeding check failed:", e)
    finally:
        db.close()
    yield

app = FastAPI(title="Airbnb Clone API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(auth.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Airbnb Clone API"}
