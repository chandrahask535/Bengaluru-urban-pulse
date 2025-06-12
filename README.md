# 🌆 Bengaluru Urban Pulse

**A real-time smart dashboard for Bengaluru's urban resilience.**  
Tracking floods, monitoring lakes, and predicting the future of urban chaos — one API call at a time.

---

![Bengaluru Urban Pulse](https://img.shields.io/badge/Status-Active-brightgreen)  


## 🚀 What is Urban Pulse?

**Bengaluru Urban Pulse** is a full-stack web platform built to:

- Predict flooding based on real-time weather data 🌧️
- Monitor lake health, track encroachments via satellite data 🛰️
- Visualize urban heat islands and planning patterns 🏙️
- Connect citizens with actionable alerts 🚨
- Provide live dashboards for researchers and civic bodies

Built as part of our final-year major project under KSCST 48th Series Sponsorship 💡

---

## 🧠 Tech Stack

| Layer       | Tech Used                                    |
|------------|-----------------------------------------------|
| Frontend    | React.js, Tailwind CSS, Mapbox GL, Recharts  |
| Backend     | FastAPI (Python), RESTful APIs               |
| Database    | Supabase (PostgreSQL), Edge Functions        |
| APIs        | OpenWeatherMap, NASA Earthdata, Mapbox       |
| Deployment  | Vercel (Frontend), Lightsail/Backend (prev.) |
| Tools       | Git, GitHub, Nginx, JSON, Pandas, GeoJSON    |

---

## 🛰️ Features

- 📡 **Real-time flood prediction** using rainfall + terrain data  
- 🌊 **Lake monitoring dashboard** — health, encroachment alerts  
- 🗺️ **Satellite imagery comparisons** from NASA for historical change detection  
- 🧠 **AI-powered land use forecasts** (planned)  
- 🔒 **Authentication + data storage** via Supabase  
- 📊 **Visual analytics** via React + Mapbox + Recharts

---

## 🛠️ How It Works

1. User hits the dashboard on `urbanpulse.vercel.app` (example)
2. React frontend fetches:
   - Weather data (OpenWeatherMap)
   - Satellite layers (NASA)
   - Real-time lake stats (mock/actual API)
3. Backend (FastAPI) runs prediction models (flood risk, encroachment likelihood)
4. Mapbox renders interactive overlays (heatmaps, lake outlines, rainfall)
5. Output is shown as **insightful charts, alerts, and geovisuals**

---

## ⚡ Getting Started (Dev Mode)

```bash
# Clone this repo
# Frontend
cd frontend
npm install
npm run dev

# Backend (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

🎓 Project Info
📍 Developed by final-year B.E. students, MVJ College of Engineering

🎖️ Sponsored under KSCST 48th Series (2024–25)

🌐 Designed for Bengaluru’s civic planning, research & public safety

💌 Contact
📧 kchandrahas863@gmail.com

