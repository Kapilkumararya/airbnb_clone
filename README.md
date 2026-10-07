# Airbnb Full-Stack Web Application (SDE Assignment)

A production-grade, photo-forward clone of the Airbnb web application replicating Airbnb's signature design, responsive user experience, and end-to-end booking workflows.

Built with **Next.js (TypeScript)** on the frontend, **Python (FastAPI)** on the backend, and **SQLite / SQLAlchemy** for data persistence.

---

## 🌐 Live Deployment & Submission Links

- **Frontend (Vercel):** `https://airbnb-clone-piut28426-kapilarya.vercel.app/` 
- **Backend (Render):** `https://airbnb-clone-bmvr.onrender.com`
- **GitHub Repository (Public):** `https://github.com/Kapilkumararya/airbnb_clone`

---

## 🧪 Demo Invigilator Account (Evaluation Mode)

For seamless evaluator and invigilator testing, the application includes a **Preloaded Dummy Evaluation Account**:

- **Auto-Login on First Visit:** When visiting the app as a first-time or unknown visitor, the app **automatically signs in** to this dummy account.
- **Preloaded Past Trips (3 Stays):**
  1. *Heritage Haveli with Courtyard & Private Rooftop* (Jaipur, Rajasthan) — Stay completed 25 days ago.
  2. *Cedar Wood Chalet with Himalayan Panoramic Views* (Manali, Himachal Pradesh) — Stay completed 45 days ago.
  3. *Riverfront Heritage Kothi Overlooking Assi Ghat* (Varanasi, Uttar Pradesh) — Stay completed 60 days ago.
  - **Review Eligibility Verified:** Because the application enforces that **only guests who have completed a stay can review a property**, the invigilator can immediately test writing and submitting reviews on `/trips` or the stayed listings!
- **Preloaded Hosted Properties (3 Listings):**
  1. *Luxury Beachfront Villa with Private Infinity Pool* (North Goa)
  2. *Modern Penthouse with View of Lotus Temple* (New Delhi)
  3. *Sea-Facing Luxury Apartment on Marine Drive* (Mumbai)
  - Preloaded with incoming bookings and revenue so the **Host Dashboard (`/host`)** metrics and reservation rows are immediately visible.
- **Manual Credentials & 1-Click Login:**
  - **Email:** `invigilator@airbnb.com`
  - **Password:** `demo123`
  - On the **Login Page (`/login`)**, a **⚡ Log in as Demo Invigilator (1-Click)** button allows returning to the dummy account at any time after logging out or testing new accounts.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS & Vanilla CSS for Airbnb micro-interactions and transitions
- **Icons & Graphics:** Inline optimized SVG icons matching Airbnb design system
- **State & Context:** React Context API (`AuthContext`), persistent `localStorage` session handling

### Backend
- **Framework:** Python 3.11+ with FastAPI
- **Server:** Uvicorn (ASGI) with lifespan auto-seeding
- **Database:** SQLite (SQLAlchemy 2.0 ORM) with flexible `DATABASE_URL` fallback
- **Authentication:** JWT (JSON Web Tokens) with `python-jose`, password hashing via `passlib[bcrypt]`
- **CORS:** Configured for cross-origin requests from frontend deployments

---

## 🏗 Architecture Overview

```
airbnbclone/
├── frontend/               # Next.js Application (Vercel-ready)
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   │   ├── page.tsx            # Explore/Home view with search & filter bars
│   │   │   ├── listing/[id]/       # Listing Detail page with dual-month calendar
│   │   │   ├── host/               # Host Dashboard (metrics, listings, reservations)
│   │   │   │   ├── create/         # Host property creation form
│   │   │   │   └── edit/[id]/      # Host property editor
│   │   │   ├── trips/              # My Trips & past bookings with review modals
│   │   │   └── login/              # Auth page with 1-click Demo login
│   │   ├── components/     # Modular UI components (Header, ListingCard, BookingWidget, Reviews)
│   │   ├── context/        # AuthContext with automatic dummy login
│   │   └── lib/            # API client fetchers (api.ts)
│   ├── .env.example        # Environment variable template
│   └── vercel.json         # Vercel deployment configuration
│
├── backend/                # FastAPI Application (Render-ready)
│   ├── app/
│   │   ├── main.py         # App entrypoint with lifespan startup auto-seed
│   │   ├── database.py     # SQLAlchemy engine, session maker, and DB URL resolver
│   │   ├── models.py       # DB relational models
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   ├── auth.py         # Password hashing & JWT token verification
│   │   ├── seed.py         # Comprehensive database seed script (27 listings, users, trips)
│   │   └── routers/
│   │       ├── auth.py     # /api/auth (login, signup, /demo, /me)
│   │       ├── listings.py # /api/listings (search, filters, CRUD, review eligibility)
│   │       ├── bookings.py # /api/bookings (create, list, cancel, check booked dates)
│   │       └── reviews.py  # /api/reviews (verified stay review submission)
│   ├── requirements.txt    # Production Python dependencies
│   ├── .env.example        # Backend environment template
│   └── render.yaml         # Render Infrastructure-as-Code blueprint
│
├── render.yaml             # Root Render deployment blueprint
├── .gitignore              # Unified repository gitignore
└── README.md               # Project documentation
```

---

## 🗄 Database Schema Design

The SQLite database schema is built using SQLAlchemy models with foreign key constraints, indexes, and relationships:

```
┌──────────────────┐          ┌──────────────────────┐
│      users       │ 1      * │       listings       │
├──────────────────┤──────────├──────────────────────┤
│ id (PK)          │          │ id (PK)              │
│ name             │          │ host_id (FK -> users)│
│ email (Unique)   │          │ title                │
│ hashed_password  │          │ description          │
│ role (guest/host)│          │ location             │
│ avatar           │          │ price_per_night      │
│ created_at       │          │ property_type        │
└─────────┬────────┘          │ max_guests           │
          │                   │ rating, review_count │
          │                   └──────────┬───────────┘
          │ 1                          1 │
          │                              │ *
          │ *                 ┌──────────┴───────────┐
┌─────────┴────────┐          │    listing_images    │
│     bookings     │          ├──────────────────────┤
├──────────────────┤          │ id (PK)              │
│ id (PK)          │          │ listing_id (FK)      │
│ listing_id (FK)  │          │ image_url            │
│ guest_id (FK)    │          │ is_primary           │
│ check_in         │          └──────────────────────┘
│ check_out        │
│ guests           │                     * ┌──────────────────────┐
│ nightly_price    │         ┌─────────────┤      amenities       │
│ cleaning_fee     │         │             ├──────────────────────┤
│ service_fee      │         │             │ id (PK)              │
│ total_price      │         │             │ name                 │
│ status           │         │             └──────────────────────┘
└─────────┬────────┘         │
          │ 1                │ *
          │                  ┌──────────────────────┐
          │ *                │   listing_amenities  │
┌─────────┴────────┐         ├──────────────────────┤
│     reviews      │         │ listing_id (FK)      │
├──────────────────┤         │ amenity_id (FK)      │
│ id (PK)          │         └──────────────────────┘
│ listing_id (FK)  │
│ user_id (FK)     │
│ rating           │
│ comment          │
│ created_at       │
└──────────────────┘
```

---

## 📡 API Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/demo` | Returns 1-click token & profile for Demo Invigilator |
| `POST` | `/api/auth/login` | Authenticate with email and password |
| `POST` | `/api/auth/signup` | Register a new user |
| `GET` | `/api/auth/me` | Get currently authenticated user profile |

### Listings (`/api/listings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/listings/` | List & filter listings by location, dates, category, guests, price |
| `GET` | `/api/listings/{id}` | Get full details of a listing with photos, host, and amenities |
| `POST` | `/api/listings/` | Host creates a new listing (authenticated) |
| `PUT` | `/api/listings/{id}` | Host edits their listing (authenticated) |
| `DELETE` | `/api/listings/{id}` | Host deletes their listing (authenticated) |
| `GET` | `/api/listings/host/my` | Get all listings hosted by current user |
| `GET` | `/api/listings/{id}/review-eligibility` | Checks if current user has completed a verified stay |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings/` | Create reservation (validates dates & overlapping blocks) |
| `GET` | `/api/bookings/my` | Get all bookings for the logged-in user |
| `GET` | `/api/bookings/listing/{id}/booked-dates` | Returns reserved date ranges for calendar blocking |
| `GET` | `/api/bookings/host/my` | Get all incoming reservations for host's properties |
| `POST` | `/api/bookings/{id}/cancel` | Cancel booking and release blocked dates |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reviews/` | Submit a review (enforces completed past stay verification) |

---

## 🌟 Feature Highlights & Rubric Alignment

1. **Home & Search:**
   - Interactive Airbnb Search Bar with **Where** (destination selector), **When** (dual-month date range picker + flexible weekend/month search), and **Who** (adults, children, infants, pets counters).
   - Category filter carousel (Beachfront, Iconic cities, Luxe, Mansions, Trending, etc.).
   - "All" category button clears all filters and restores full catalog.
   - Dynamic price toggle ("Show price per night" vs "Prices include all fees").

2. **Listing Detail Page:**
   - 5-photo responsive grid gallery with hover zoom.
   - Dual-month interactive availability calendar that blocks already reserved dates.
   - Dynamic price calculation that scales fees and extra guest charges.
   - "Meet your Host" card with Superhost badges and Guest-to-Host messaging modal placeholder.
   - Styled map preview with pinned property location.

3. **Booking & Verification Flow:**
   - Overlap validation prevents double-booking.
   - Instant mocked checkout confirmation modal with itemized fee breakdown.
   - "My Trips & Bookings" page displaying upcoming and past trips with cancellation.

4. **Completed-Stay Review Verification (Bonus):**
   - Review form on the listing detail page only appears if the user has an officially completed stay.
   - The My Trips page enables instant review submission on completed past bookings.

5. **Host Dashboard (CRUD):**
   - Host overview of owned listings, total revenue, and occupancy metrics.
   - Add new listing form with amenities selection and multiple photo URLs.
   - Edit pricing and title or delete listings in real-time.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.11+ & pip

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run initial seed script (creates airbnbclone.db)
python -m app.seed

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
*Backend runs on `http://127.0.0.1:8000` (API documentation available at `http://127.0.0.1:8000/docs`).*

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 💡 Assumptions Made

1. **Mocked Payment:** Real card processing is out of scope per assignment instructions; mocked payment method selection (Credit Card / UPI / Instant) is provided in checkout.
2. **Maps:** Displayed as lightweight static visual map components with coordinates and location callouts.
3. **Database Seeding:** On production platforms with ephemeral filesystems (like Render free tier), the server automatically checks if the database is empty and auto-seeds all listings, users, and trips on startup.
