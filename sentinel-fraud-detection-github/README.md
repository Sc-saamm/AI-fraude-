# Sentinel — Real-Time Fraud Detection Dashboard

A modern, minimalist fraud detection and risk scoring web application built with React, Vite, and Tailwind CSS.

## Features

- **Overview & Live Transaction Feed**: Real-time stream of payment events with instant status filtering (`All`, `Approved`, `Review`, `Blocked`), search by transaction ID, merchant, or location, and live KPI metrics.
- **Slide-Over Case Investigation Drawer**: Click any transaction to inspect risk factor weights, device fingerprint metadata, IP velocity, editable analyst notes, and one-click **Approve** or **Block & Flag** actions.
- **Interactive Risk Scoring Simulator**: Test risk model behavior in real time using sliders for transaction amount, account tenure, IP distance, transaction velocity, and device trust—complete with an animated risk gauge and **Push to Live Feed** functionality.
- **Detection Rules Engine**: Toggle and inspect automated heuristic and ML scoring rules with live trigger counts and precision metrics.
- **24-Hour Anomaly Telemetry**: Visual comparison of legitimate volume vs. flagged anomalies across a 24-hour window.

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```text
sentinel-fraud-detection/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── App.jsx
    ├── index.css
    └── main.jsx
```
