# StressAtlas 🧘‍♀️

A modern, AI-powered wellness application for tracking stress, sleep, and overall mental health. Built with React, Vite, and Google Gemini AI.

![StressAtlas](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

## ✨ Features

### 🏠 Dashboard
- **AI-Powered Daily Insights**: Personalized wellness recommendations powered by Google Gemini
- **Sleep Quality Tracking**: 7-day sleep overview with interactive charts
- **Activity Monitoring**: Weekly step tracking and visualization
- **Journal Integration**: Quick access to your wellness journal with heatmap view
- **Smart Search**: Intelligent navigation search with keyword matching

### 📊 Health Data Analysis
- **Stress Timeline**: Real-time stress level tracking throughout the day
- **Sleep Stages**: Detailed sleep analysis (coming soon)
- **Interactive Charts**: Beautiful, responsive data visualizations

### 🏥 Medical Vitals
- Heart Rate monitoring
- Blood Pressure tracking
- Blood Oxygen levels
- Body Temperature

### 📅 Journal & Calendar
- Daily journal entries
- Calendar view with entry heatmap
- Mood and activity tracking

### 🎮 Stress Relief Zone
- **Breathing Assistant**: Guided breathing exercises
- **Memory Game**: Interactive stress-relief game
- Calming activities and exercises

### 🤖 AI Chat Assistant
- Real-time AI-powered mental health support
- Contextual conversation history
- Soothing, empathetic responses

### ⚙️ Settings
- Profile management
- Subscription details
- Security settings
- Third-party integrations (Apple Health, Google Fit, Fitbit)
- Dark mode support

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- MongoDB (optional, for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stress-game-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd src/server
   npm install
   cd ../..
   ```

4. **Configure environment variables**
   
   Create `.env` file in `src/server/`:
   ```bash
   cp src/server/.env.example src/server/.env
   ```
   
   Edit `src/server/.env` and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://localhost:27017/stress-game-app
   PORT=5001
   ```

5. **Update API Key in Frontend** (for development)
   
   Edit `src/App.jsx` line 19:
   ```javascript
   const GEMINI_API_KEY = "your_gemini_api_key_here";
   ```

### Running the Application

#### Development Mode

You need to run both the **frontend** and **backend** simultaneously:

**Terminal 1 - Frontend:**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd src/server
npm run dev
```
The API will run on `http://localhost:5001`

#### Production Build

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Google Generative AI SDK** - AI integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Google Gemini API** - AI processing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
stress-game-app/
├── src/
│   ├── components/          # React components
│   │   ├── AIInsightCard.jsx
│   │   ├── CalendarJournal.jsx
│   │   ├── Login.jsx
│   │   ├── SettingsView.jsx
│   │   ├── StressRelief.jsx
│   │   └── ...
│   ├── server/              # Backend API
│   │   ├── models/
│   │   │   └── UserMetrics.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env.example
│   ├── App.jsx              # Main application
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Features in Detail

### AI Integration

StressAtlas uses Google Gemini 1.5 Flash for:
- **Daily Insights**: Personalized wellness recommendations based on your sleep and stress data
- **Chat Assistant**: Real-time conversational support for mental health
- **Context-Aware Responses**: AI maintains conversation history for better understanding

### Data Visualization

- **Bar Charts**: Sleep quality and step tracking
- **Area Charts**: Stress timeline visualization
- **Heatmaps**: Journal entry frequency
- **Responsive Design**: Charts adapt to screen size

### Search Functionality

Smart search with:
- Keyword matching across all app sections
- Real-time dropdown results
- Quick navigation to any feature

## 🔐 Security Notes

> **⚠️ Important**: The Gemini API key is currently hardcoded in `App.jsx` for development purposes. For production:
> 
> 1. Move all API calls to the backend
> 2. Store API keys in environment variables
> 3. Never commit `.env` files to version control
> 4. Use a proxy server to hide API keys from client-side code

## 🐛 Troubleshooting

### Port 5000 Already in Use

If you get `EADDRINUSE` error on port 5000:
- The backend is configured to use port **5001** by default
- Update your `.env` file: `PORT=5001`

### MongoDB Connection Error

If MongoDB fails to connect:
- Ensure MongoDB is installed and running
- Check the `MONGODB_URI` in your `.env` file
- The app will still work with mock data if MongoDB is unavailable

### White Screen on Settings

If you see a white screen when clicking settings:
- This was a known issue with missing `Crown` icon import
- Fixed in the latest version
- Clear your browser cache and refresh

## 📝 API Endpoints

### Backend Routes

- `GET /api/metrics` - Fetch user health metrics
- `POST /api/chat` - Send message to AI assistant

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] Real database integration
- [ ] Apple Health / Google Fit sync
- [ ] Advanced sleep stage analysis
- [ ] Medication reminders
- [ ] Export data to PDF/CSV
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Mo**

## 🙏 Acknowledgments

- Google Gemini AI for powering the intelligent features
- Recharts for beautiful data visualizations
- Lucide for the icon set
- Tailwind CSS for the styling framework

---

**Built with ❤️ for better mental health and wellness**
