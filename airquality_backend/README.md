# Air Quality Backend — Django + DRF

Air quality monitoring API for the Almaty Air Initiative university project.

---

## Quick Setup

```bash
# 1. Clone the repo and enter this folder
cd airquality_backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply migrations
python manage.py migrate

# 5. Create a superuser (for admin panel)
python manage.py createsuperuser

# 6. Run the server
python manage.py runserver
```

The API will be available at: **http://localhost:8000/api/**  
Admin panel: **http://localhost:8000/admin/**

---

## Architecture

### Models (5 total)

| Model | Description | Manager |
|-------|-------------|---------|
| `UserProfile` | Extends User with bio/avatar | Default |
| `Station` | Air quality monitoring station | Default |
| `AirQualityReading` | AQI, PM2.5, PM10, NO2, O3, CO per station | Default |
| `NewsPost` | News/blog articles (full CRUD) | Default |
| `Comment` | Comments on posts (soft delete) | **Custom: `PublishedCommentManager`** |

### ForeignKey Relationships
- `AirQualityReading.station` → `Station`
- `NewsPost.author` → `User`
- `Comment.post` → `NewsPost`
- `Comment.author` → `User`

### Serializers
| Type | Name | Purpose |
|------|------|---------|
| `Serializer` | `RegisterSerializer` | User registration with validation |
| `Serializer` | `AirQualitySummarySerializer` | Read-only DTO for dashboard |
| `ModelSerializer` | `UserProfileSerializer` | User profile |
| `ModelSerializer` | `StationSerializer` | Station CRUD |
| `ModelSerializer` | `AirQualityReadingSerializer` | Readings |
| `ModelSerializer` | `NewsPostSerializer` | News posts with comment count |
| `ModelSerializer` | `CommentSerializer` | Comments |

### Views

**Function-Based Views (FBV) with DRF decorators:**
- `POST /api/auth/register/` — register new user
- `POST /api/auth/login/` — login, returns token
- `POST /api/auth/logout/` — invalidate token
- `GET  /api/auth/me/` — current user profile

**Class-Based Views (CBV) using APIView:**
- `StationListView` — GET/POST stations
- `AirQualityReadingListView` — GET/POST readings
- `AirQualitySummaryView` — GET dashboard summary
- `FetchFromOpenAQView` — POST trigger OpenAQ fetch
- `NewsPostListCreateView` — GET/POST posts
- `NewsPostDetailView` — GET/PUT/PATCH/DELETE single post
- `CommentListCreateView` — GET/POST comments
- `CommentDeleteView` — DELETE (soft) comment

---

## API Endpoints

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/           [Auth required]
GET    /api/auth/me/               [Auth required]

GET    /api/stations/
POST   /api/stations/              [Admin only]

GET    /api/readings/?station=<id>
POST   /api/readings/              [Auth required]

GET    /api/air-summary/
POST   /api/fetch-openaq/          [Auth required]

GET    /api/posts/
POST   /api/posts/                 [Auth required]
GET    /api/posts/<id>/
PUT    /api/posts/<id>/            [Author/Admin]
PATCH  /api/posts/<id>/            [Author/Admin]
DELETE /api/posts/<id>/            [Author/Admin]

GET    /api/posts/<id>/comments/
POST   /api/posts/<id>/comments/   [Auth required]
DELETE /api/comments/<id>/         [Author/Admin]
```

---

## Authentication

Token-based. Include in every authenticated request:
```
Authorization: Token <your_token>
```

---

## OpenAQ Integration

1. Create a Station in the admin panel with an `openaq_location_id`.
2. Call `POST /api/fetch-openaq/` (with auth token) to fetch and save latest data.

Almaty OpenAQ location IDs can be found at:  
https://api.openaq.org/v3/locations?city=Almaty

---

## Postman Collection

Import `postman_collection.json` into Postman.  
Set the `token` variable after logging in.
