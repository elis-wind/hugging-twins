# StressAtlas 🧘‍♀️

A modern, AI-powered wellness and stress management application built with React. StressAtlas helps users track their health metrics, manage stress levels, maintain a wellness journal, and receive personalized insights from an AI wellness coach.

![StressAtlas](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-cyan)
![License](https://img.shields.io/badge/license-Private-red)

## ✨ Features

### 🏠 Dashboard
- **AI-Powered Daily Insights**: Personalized wellness recommendations powered by Google's Gemini AI
- **Sleep Quality Tracking**: 7-day sleep overview with interactive charts
- **Activity Monitoring**: Weekly step count tracking and visualization
- **Stress Timeline**: Real-time stress level monitoring throughout the day
- **Journal Heatmap**: Visual representation of journaling consistency

### 📊 Health Data Analysis
- **Comprehensive Metrics**: Track sleep patterns, activity levels, and stress indicators
- **Interactive Charts**: Beautiful visualizations using Recharts
- **Date Navigation**: Browse historical health data day by day
- **Correlation Analysis**: Understand relationships between different health metrics

### 🏥 Medical Vitals
- Heart Rate monitoring
- Blood Pressure tracking
- Blood Oxygen (SpO2) levels
- Body Temperature readings

### 📝 Journal & History
- Daily journaling with calendar view
- Mood tracking and reflection
- Historical entry browsing
- Visual activity heatmap

### 🎮 Stress Relief Zone
- Interactive breathing exercises
- Calming activities and games
- Mindfulness tools
- Relaxation techniques

### 🤖 AI Wellness Coach
- Real-time chat with AI assistant
- Personalized wellness advice
- Empathetic, supportive responses
- Context-aware recommendations

### ⚙️ Settings & Customization
- Dark/Light mode toggle
- User profile management
- Premium subscription features
- Account preferences

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stress-game-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   > **Note**: Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   
   > **Security**: Never commit your `.env` file to Git! It's already in `.gitignore`.

4. **(Optional) Setup Backend**
   
   If using the backend server:
   ```bash
   cd src/server
   cp .env.example .env
   # Edit src/server/.env with your credentials
   npm install
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Project Structure

```
stress-game-app/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── AIInsightCard.jsx
│   │   ├── BrandLogo.jsx
│   │   ├── CalendarJournal.jsx
│   │   ├── Login.jsx
│   │   ├── SettingsView.jsx
│   │   ├── StressRelief.jsx
│   │   └── ...
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   ├── index.css           # Global styles
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## 🛠️ Built With

### Core Technologies
- **[React 19.2.0](https://react.dev/)** - UI framework
- **[Vite 7.2.4](https://vitejs.dev/)** - Build tool and dev server
- **[TailwindCSS 3.4.1](https://tailwindcss.com/)** - Utility-first CSS framework

### Key Dependencies
- **[@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)** - Google Gemini AI integration
- **[Recharts](https://recharts.org/)** - Charting library for data visualization
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[PostCSS](https://postcss.org/)** & **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS processing

## 📜 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🎨 Design Philosophy

StressAtlas follows modern web design principles:

- **Warm Color Palette**: Earthy tones (#2C2420, #8B7355, #FDFBF7) for a calming experience
- **Glassmorphism**: Subtle backdrop blur effects for depth
- **Smooth Animations**: Gentle transitions and hover effects
- **Responsive Design**: Optimized for all screen sizes
- **Dark Mode Support**: Eye-friendly theme switching
- **Accessibility**: Semantic HTML and ARIA labels

## 🔐 Privacy & Security

- All health data is stored locally in your browser
- No data is sent to external servers (except AI chat requests to Google Gemini)
- API keys should be kept secure and never committed to version control
- Consider using environment variables for production deployments

## 🚧 Development Roadmap

- [ ] Backend integration for data persistence
- [ ] User authentication and multi-user support
- [ ] Export health data (PDF, CSV)
- [ ] Integration with wearable devices (Apple Watch, Fitbit)
- [ ] Advanced analytics and trend predictions
- [ ] Social features and community support
- [ ] Mobile app (React Native)
- [ ] Offline mode with service workers

## 🤝 Contributing

This is a private project. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- Google Gemini AI for powering the intelligent wellness coach
- Recharts team for the excellent charting library
- Lucide for the beautiful icon set
- The React and Vite communities

## 📧 Contact

For questions or support, please contact the development team.

---

**Made with ❤️ for wellness and mental health**
