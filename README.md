# 🌬️ AirAlmaty — Air Quality Monitoring in Almaty

> AirAlmaty is a web platform for tracking air pollution
> in Almaty in real time. It helps residents make informed
> decisions about outdoor activities and daily life based
> on up-to-date environmental data.

---

## 🚀 About the Project

Almaty is one of the most polluted cities in the CIS.
Most residents have no convenient tool to check whether
it is safe to go for a run, open a window, or take their
child to the park.

AirAlmaty solves this: the platform displays air quality
data across all districts of Almaty, gives personalized
recommendations, and shows historical pollution trends.

---

## ✨ Features

- Interactive map with color-coded pollution zones
- Dashboard with charts by day, week, and month
- Smart daily recommendations based on air quality
- Data for each of Almaty's 8 districts
- Responsive design for mobile and desktop


---

## 🛠️ Tech Stack

**Frontend**
- Angular
- TypeScript
- HTML5 / CSS3

**Backend**
- Python
- Django
- Django REST Framework

**Database**
- SQLite 

---

## 📁 Project Structure

```
airalmaty/
├── backend/
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── requirements.txt
│   ├── .gitignore
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   ├── services/
    │   │   └── app.module.ts
    │   └── environments/
    └── package.json
```

---

## ⚙️ Installation & Setup

### Backend (Django)

```bash
# 1. Clone the repository
git clone https://github.com/Asagynbek0/airalmaty.git
cd airalmaty/backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Start the server
python manage.py runserver
```

API available at: http://127.0.0.1:8000

### Frontend (Angular)

```bash
cd airalmaty/frontend

# Install dependencies
npm install

# Start the dev server
ng serve
```

App available at: http://localhost:4200

---

## 🌐 API Endpoints

| Method | Endpoint                        | Description                   |
|--------|---------------------------------|-------------------------------|
| GET    | /api/districts/                 | List of all districts         |
| GET    | /api/districts/<id>/      | Single district data          |
| GET    | /api/airdata/                   | All air quality records       |
| GET    | /api/airdata/<id>/        | Single air quality record     |
| GET    | /api/districts/<id>/airdata/ | Air data by district       |

---

## 👥 Team

| Name | Role              |
|------|-------------------|
| Alinur| Frontend (Angular)|
| Abdulmukhit| Backend (Django)  |
| Beibit Imekeyev | Design / UI       |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Made with ❤️ in Almaty
