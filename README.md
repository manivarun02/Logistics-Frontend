# Logistics Management System – Frontend

This repository contains the frontend application of a Logistics Management System.
The application is built using React with Vite and provides user-friendly dashboards
for managing logistics operations such as trucks, drivers, carriers, loading, and unloading.

This project is designed to integrate with a Java / Spring Boot backend and is suitable
for deployment on cloud platforms like AWS.

---

## 🚀 Features

- User Authentication (Login & Registration)
- Admin Dashboard
- Truck Management
- Driver Management
- Carrier Management
- Loading Management
- Unloading Management
- Distance Calculation Utility
- Responsive and clean UI

---

## 🛠️ Tech Stack

- React (Vite)
- JavaScript (ES6)
- Axios (API Communication)
- CSS
- Vite (Build Tool)

---

## 📂 Project Structure

src/
 ├── pages/
 │   ├── admin/
 │   │   ├── TruckManager.jsx
 │   │   ├── DriverManager.jsx
 │   │   ├── CarrierManager.jsx
 │   │   ├── LoadingManager.jsx
 │   │   └── UnloadingManager.jsx
 │   ├── Login.jsx
 │   ├── Register.jsx
 │   ├── AdminDashboard.jsx
 │   └── UserDashboard.jsx
 ├── services/
 │   ├── api.js
 │   ├── distance.js
 │   └── fetch.jsx
 ├── App.jsx
 └── main.jsx
public/
 └── images/

---

## ▶️ How to Run the Project Locally

1. Clone the repository  
   git clone https://github.com/manivarun02/Logistics-Frontend.git

2. Go to project folder  
   cd Logistics-Frontend

3. Install dependencies  
   npm install

4. Start project  
   npm run dev

5. Open in browser  
   http://localhost:5173

---

## 🌐 Backend Integration

The frontend communicates with a backend via REST APIs.
The backend will be deployed on AWS EC2 and the API URL
will be configured using environment variables.

Example:
VITE_API_BASE_URL=http://<AWS-EC2-IP>:8080

---

## 🚢 Deployment

Frontend can be deployed using Netlify, Vercel, or AWS S3.

---

## 👤 Author

Mani Varun  
Frontend Developer | Java Full Stack Aspirant
