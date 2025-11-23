require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const UserMetrics = require('./models/UserMetrics');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
	origin: 'http://localhost:5173', // Allow Vite frontend
	credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stress-game-app', {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
	.then(() => console.log('MongoDB Connected'))
	.catch(err => console.error('MongoDB Connection Error:', err));

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- API Routes ---

// GET /api/metrics
app.get('/api/metrics', async (req, res) => {
	try {
		// Mock data for now, eventually fetch from DB
		// const metrics = await UserMetrics.find({ userId: req.query.userId });
		const mockMetrics = {
			sleep: { average: 7.4, weekly: [] },
			steps: { average: 8432, weekly: [] },
			stress: { current: 42, history: [] },
			journal: { entriesThisMonth: 24 }
		};
		res.json(mockMetrics);
	} catch (error) {
		res.status(500).json({ error: 'Server Error' });
	}
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
	const { message, history } = req.body;

	if (!message) {
		return res.status(400).json({ error: 'Message is required' });
	}

	try {
		// Construct prompt with history if provided
		let prompt = "You are an empathetic, calming wellness coach. Keep answers short and supportive.\n\n";
		if (history && Array.isArray(history)) {
			const conversationHistory = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
			prompt += conversationHistory + "\n";
		}
		prompt += `User: ${message}\nAssistant:`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		res.json({ response: text });
	} catch (error) {
		console.error('Gemini API Error:', error);
		res.status(500).json({ error: 'Failed to generate response' });
	}
});

// Start Server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
