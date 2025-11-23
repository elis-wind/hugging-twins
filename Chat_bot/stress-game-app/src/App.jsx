import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Home, Activity, Calendar, MessageCircle, Settings, Search, Moon, Sun, BookOpen, X, Send, Timer, Heart, Droplet, ChevronLeft, ChevronRight, ArrowLeft, Stethoscope, Sparkles } from 'lucide-react';
import BrandLogo from './components/BrandLogo';
import Login from './components/Login';
import SettingsView from './components/SettingsView';
import AIInsightCard from './components/AIInsightCard';
import StressRelief from './components/StressRelief';
import CalendarJournal from './components/CalendarJournal';

// --- CONFIGURATION ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const AI_PERSONA = "You are an empathetic, calming wellness coach.";

const NAV_ITEMS = [
	{ id: 'home', label: 'Dashboard', keywords: ['home', 'summary', 'main', 'ai'], icon: Home },
	{ id: 'healthdata', label: 'Health Data Analysis', keywords: ['rings', 'sleep', 'steps', 'activity', 'charts'], icon: Activity },
	{ id: 'calendar', label: 'Journal & History', keywords: ['diary', 'past', 'record', 'date'], icon: Calendar },
	{ id: 'relief', label: 'Stress Relief Zone', keywords: ['breathe', 'game', 'calm', 'relax'], icon: Sparkles },
	{ id: 'medicalvitals', label: 'Medical Vitals', keywords: ['doctor', 'hrv', 'spo2', 'blood', 'clinical'], icon: Stethoscope },
	{ id: 'settings', label: 'Settings', keywords: ['profile', 'account', 'dark mode', 'subscription'], icon: Settings },
	{ id: 'chat', label: 'AI Coach', keywords: ['chat', 'bot', 'assistant', 'help'], icon: MessageCircle }
];

// --- MOCK DATA ---
const MOCK_API_DATA = {
	user: { name: "Mo", isPremium: true },
	dashboard: {
		sleep: {
			average: 7.4,
			weekly: [
				{ date: 'Mon', totalSleep: 6.5 },
				{ date: 'Tue', totalSleep: 7.2 },
				{ date: 'Wed', totalSleep: 7.8 },
				{ date: 'Thu', totalSleep: 6.9 },
				{ date: 'Fri', totalSleep: 7.5 },
				{ date: 'Sat', totalSleep: 8.2 },
				{ date: 'Sun', totalSleep: 7.4 }
			]
		},
		steps: {
			average: 8432,
			weekly: [
				{ day: 'Mon', steps: 4500 },
				{ day: 'Tue', steps: 7200 },
				{ day: 'Wed', steps: 8900 },
				{ day: 'Thu', steps: 6400 },
				{ day: 'Fri', steps: 9100 },
				{ day: 'Sat', steps: 5300 },
				{ day: 'Sun', steps: 8432 },
			]
		},
		stress: {
			current: 42,
			history: [
				{ time: '8am', level: 25 },
				{ time: '10am', level: 35 },
				{ time: '12pm', level: 45 },
				{ time: '2pm', level: 72 },
				{ time: '4pm', level: 55 },
				{ time: '6pm', level: 38 },
				{ time: '8pm', level: 28 },
				{ time: '10pm', level: 22 }
			]
		},
		journal: {
			entriesThisMonth: 24,
			heatmap: Array(5).fill(Array(7).fill(true))
		}
	},
	aiInsightFallback: {
		greeting: "Good morning, Mo.",
		sleepInsight: "Your REM cycle was interrupted at 3 AM. This correlates with the high room temperature recorded by your watch.",
		stressContext: "Your heart rate variability is low right now. The calendar shows a 'Budget Review' in 30 mins, which is the likely trigger.",
		actionableTip: "Try the 'Box Breathing' exercise for 2 minutes before the meeting starts."
	}
};

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showSplash, setShowSplash] = useState(true);
	const [darkMode, setDarkMode] = useState(false);
	const [currentView, setCurrentView] = useState('dashboard');
	const [activeTab, setActiveTab] = useState('home');
	const [viewMode, setViewMode] = useState('home');
	const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 22));
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [chatMessages, setChatMessages] = useState([
		{ role: 'assistant', content: 'Hello Mo! How are you feeling today?' },
	]);
	const [messageInput, setMessageInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [aiInsightData, setAiInsightData] = useState(MOCK_API_DATA.aiInsightFallback);

	const userName = MOCK_API_DATA.user.name;
	const dashboardData = MOCK_API_DATA.dashboard;

	// Fetch Daily Insight
	useEffect(() => {
		const fetchDailyInsight = async () => {
			if (!GEMINI_API_KEY) {
				setAiInsightData(MOCK_API_DATA.aiInsightFallback);
				return;
			}

			try {
				const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
				const prompt = `${AI_PERSONA} Generate a JSON object with keys: greeting, sleepInsight, stressContext, actionableTip. Based on user data: Sleep 7.4h avg, Stress 42/100. Generate daily insight.`;
				const result = await model.generateContent(prompt);
				const response = await result.response;
				let textContent = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

				try {
					const parsedContent = JSON.parse(textContent);
					setAiInsightData(parsedContent);
				} catch (e) {
					console.error("Failed to parse AI response", e);
					setAiInsightData(MOCK_API_DATA.aiInsightFallback);
				}
			} catch (error) {
				console.error("Error fetching daily insight:", error);
				setAiInsightData(MOCK_API_DATA.aiInsightFallback);
			}
		};

		if (isLoggedIn) fetchDailyInsight();
	}, [isLoggedIn]);

	// Splash Screen
	useEffect(() => {
		if (showSplash) {
			const timer = setTimeout(() => setShowSplash(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [showSplash]);

	const handleSendMessage = async () => {
		if (messageInput.trim() === '') return;

		const newUserMessage = { role: 'user', content: messageInput };
		const updatedMessages = [...chatMessages, newUserMessage];

		setChatMessages(updatedMessages);
		setMessageInput('');
		setIsTyping(true);

		if (!GEMINI_API_KEY) {
			setTimeout(() => {
				setChatMessages(prev => [...prev, {
					role: 'assistant',
					content: "I'm here to support you. (Please add a Gemini API Key to enable real chat!)"
				}]);
				setIsTyping(false);
			}, 1000);
			return;
		}

		try {
			const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
			const conversationHistory = updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
			const prompt = `You are a helpful, soothing mental health assistant. Keep answers short and supportive.\n\n${conversationHistory}\nAssistant:`;
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();

			setChatMessages(prev => [...prev, { role: 'assistant', content: text }]);
		} catch (error) {
			console.error("Error sending message:", error);
			setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
		} finally {
			setIsTyping(false);
		}
	};

	const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
	const navigateDate = (days) => {
		const newDate = new Date(selectedDate);
		newDate.setDate(selectedDate.getDate() + days);
		setSelectedDate(newDate);
	};

	const visibleSidebarItems = NAV_ITEMS.filter(item => item.id !== 'settings');
	const shouldShow = (title) => !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase());
	const filteredNav = NAV_ITEMS.filter(item => {
		if (!searchQuery) return false;
		const query = searchQuery.toLowerCase();
		return item.label.toLowerCase().includes(query) || item.keywords.some(k => k.toLowerCase().includes(query));
	});

	const handleNavSearchClick = (item) => {
		if (item.id === 'settings') {
			setCurrentView('settings');
		} else {
			setActiveTab(item.id);
			setCurrentView('dashboard');
			setViewMode('home');
			if (item.id === 'chat') setIsChatOpen(true);
		}
		setSearchQuery('');
	};

	const renderHomeView = () => (
		<div className="px-8 pb-8">
			<div className="flex flex-col gap-6">
				{shouldShow('Daily Insight') && <AIInsightCard data={aiInsightData} />}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="flex flex-col gap-6">
						{shouldShow('Sleep Quality') && (
							<div
								onClick={() => { setActiveTab('healthdata'); setViewMode('home'); }}
								className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-[#E8E3DC] dark:border-stone-700 cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none transition-all duration-300 transform hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-700 relative overflow-hidden group h-80 flex flex-col justify-between"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 dark:group-hover:from-indigo-900/20 group-hover:to-purple-50/30 dark:group-hover:to-purple-900/20 transition-all duration-300 rounded-3xl"></div>
								<div className="relative z-10 h-full flex flex-col justify-between">
									<div className="mb-2">
										<h3 className="text-lg font-semibold text-[#2C2420] dark:text-stone-100 mb-1">Sleep Quality</h3>
										<p className="text-xs text-[#8B7355] dark:text-stone-400">7-day overview</p>
									</div>
									<div className="flex flex-col gap-4 flex-1 justify-end">
										<div>
											<div className="text-4xl font-bold mb-1" style={{ color: '#82ca9d' }}>{dashboardData.sleep.average}h</div>
											<div className="text-sm text-[#8B7355] dark:text-stone-400 font-medium">Weekly Avg</div>
										</div>
										<div className="w-full">
											<ResponsiveContainer width="100%" height={160}>
												<BarChart data={dashboardData.sleep.weekly} barSize={50}>
													<XAxis hide />
													<YAxis hide domain={[0, 10]} />
													<Tooltip
														contentStyle={{
															backgroundColor: darkMode ? '#292524' : 'rgba(255, 255, 255, 0.98)',
															border: 'none',
															borderRadius: '8px',
															padding: '6px 10px',
															boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
															color: darkMode ? '#f5f5f4' : '#1F2937'
														}}
														labelStyle={{ color: darkMode ? '#e7e5e4' : '#1F2937', fontWeight: '600', fontSize: '11px' }}
														itemStyle={{ color: '#82ca9d', fontSize: '11px' }}
														formatter={(value) => [`${value.toFixed(1)}h`, 'Sleep']}
														cursor={{ fill: 'rgba(130, 202, 157, 0.1)' }}
													/>
													<Bar dataKey="totalSleep" fill="#82ca9d" radius={[6, 6, 0, 0]} />
												</BarChart>
											</ResponsiveContainer>
										</div>
									</div>
								</div>
							</div>
						)}

						{shouldShow('Journal') && (
							<div
								onClick={() => setActiveTab('calendar')}
								className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-6 shadow-sm text-white cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] w-full"
							>
								<div className="flex items-center gap-2 mb-4">
									<BookOpen className="w-5 h-5" />
									<h3 className="text-lg font-semibold">Journal</h3>
								</div>
								<div className="text-4xl font-bold mb-2">{dashboardData.journal.entriesThisMonth}</div>
								<p className="text-sm text-orange-100 mb-4">Entries this month</p>
								<div className="grid grid-cols-7 gap-2">
									{dashboardData.journal.heatmap.flat().map((active, index) => (
										<div key={index} className={`w-6 h-6 rounded-lg ${active ? 'bg-white' : 'bg-white/30'}`} />
									))}
								</div>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-6">
						{shouldShow('Weekly Steps') && (
							<div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-[#E8E3DC] dark:border-stone-700 transition-colors duration-300 h-80 flex flex-col justify-between">
								<div className="mb-2">
									<h3 className="text-lg font-semibold text-[#2C2420] dark:text-stone-100 mb-1">Weekly Steps</h3>
									<p className="text-xs text-[#8B7355] dark:text-stone-400">7-day activity</p>
								</div>
								<div className="flex flex-col gap-4 flex-1 justify-end">
									<div>
										<div className="text-4xl font-bold mb-1 text-[#fb923c]">{dashboardData.steps.average.toLocaleString()}</div>
										<div className="text-sm text-[#8B7355] dark:text-stone-400 font-medium">Avg Steps</div>
									</div>
									<div className="w-full">
										<ResponsiveContainer width="100%" height={160}>
											<BarChart data={dashboardData.steps.weekly} barSize={50}>
												<XAxis hide />
												<YAxis hide domain={[0, 10000]} />
												<Tooltip
													cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }}
													contentStyle={{
														backgroundColor: darkMode ? '#292524' : 'rgba(255, 255, 255, 0.98)',
														border: 'none',
														borderRadius: '8px',
														padding: '6px 10px',
														boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
														color: darkMode ? '#f5f5f4' : '#1F2937'
													}}
													labelStyle={{ color: darkMode ? '#e7e5e4' : '#1F2937', fontWeight: '600', fontSize: '11px' }}
													itemStyle={{ color: '#fb923c', fontSize: '11px' }}
													formatter={(value) => [`${value.toLocaleString()}`, 'Steps']}
												/>
												<Bar dataKey="steps" fill="#fb923c" radius={[6, 6, 0, 0]} />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>
						)}

						{shouldShow('Bot Assistance') && (
							<div
								onClick={() => setIsChatOpen(true)}
								className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-3xl p-6 shadow-sm text-white cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 w-full"
							>
								<div className="flex items-center gap-2 mb-4">
									<MessageCircle className="w-5 h-5" />
									<h3 className="text-lg font-semibold">Bot Assistance</h3>
								</div>
								<div className="space-y-3">
									<div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm"><p className="text-sm">Morning meditation completed</p></div>
									<div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm"><p className="text-sm">Stress levels improving</p></div>
									<div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm"><p className="text-sm">Click to chat with me!</p></div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	const renderMedicalVitalsView = () => (
		<div className="px-8 pb-8">
			<div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-[#E8E3DC] dark:border-stone-700 mb-6 transition-colors duration-300">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-md">
							<Stethoscope className="w-7 h-7 text-white" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100">Medical Vitals</h2>
							<p className="text-sm text-[#8B7355] dark:text-stone-400 mt-1">Clinical health metrics and raw data</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<button onClick={() => navigateDate(-1)} className="p-2 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 rounded-xl transition-colors">
							<ChevronLeft className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
						</button>
						<span className="text-lg font-bold text-[#2C2420] dark:text-stone-100 min-w-[140px] text-center">{formatDate(selectedDate)}</span>
						<button onClick={() => navigateDate(1)} className="p-2 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 rounded-xl transition-colors">
							<ChevronRight className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
							<Heart className="w-5 h-5 text-red-500" />
						</div>
						<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Heart Rate</h3>
					</div>
					<div className="text-4xl font-bold text-[#2C2420] dark:text-stone-100 mb-1">
						{MOCK_API_DATA.dashboard.stress.current + 30} <span className="text-lg text-[#8B7355] dark:text-stone-400 font-normal">bpm</span>
					</div>
					<p className="text-sm text-[#8B7355] dark:text-stone-400">Normal resting range</p>
				</div>

				<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
							<Activity className="w-5 h-5 text-blue-500" />
						</div>
						<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Blood Pressure</h3>
					</div>
					<div className="text-4xl font-bold text-[#2C2420] dark:text-stone-100 mb-1">
						120/80 <span className="text-lg text-[#8B7355] dark:text-stone-400 font-normal">mmHg</span>
					</div>
					<p className="text-sm text-[#8B7355] dark:text-stone-400">Optimal</p>
				</div>

				<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
							<Droplet className="w-5 h-5 text-cyan-500" />
						</div>
						<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Blood Oxygen</h3>
					</div>
					<div className="text-4xl font-bold text-[#2C2420] dark:text-stone-100 mb-1">98%</div>
					<p className="text-sm text-[#8B7355] dark:text-stone-400">Healthy saturation</p>
				</div>

				<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
							<Timer className="w-5 h-5 text-orange-500" />
						</div>
						<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Body Temp</h3>
					</div>
					<div className="text-4xl font-bold text-[#2C2420] dark:text-stone-100 mb-1">98.6°F</div>
					<p className="text-sm text-[#8B7355] dark:text-stone-400">Normal</p>
				</div>
			</div>
		</div>
	);

	const renderHealthDataView = () => (
		<div className="px-8 pb-8">
			<div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-[#E8E3DC] dark:border-stone-700 mb-6 transition-colors duration-300">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100">Health Data Analysis</h2>
						<p className="text-sm text-[#8B7355] mt-1">Daily activity rings for {formatDate(selectedDate)}</p>
					</div>
					<div className="flex items-center gap-4">
						<button onClick={() => navigateDate(-1)} className="p-2 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 rounded-xl transition-colors">
							<ChevronLeft className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
						</button>
						<span className="text-lg font-bold text-[#2C2420] dark:text-stone-100 min-w-[140px] text-center">{formatDate(selectedDate)}</span>
						<button onClick={() => navigateDate(1)} className="p-2 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 rounded-xl transition-colors">
							<ChevronRight className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm">
					<h3 className="text-lg font-bold text-[#2C2420] dark:text-stone-100 mb-4">Stress Timeline</h3>
					<div className="h-64 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={dashboardData.stress.history}>
								<defs>
									<linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#44403c' : '#E8E3DC'} />
								<XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#a8a29e' : '#8B7355', fontSize: 12 }} />
								<YAxis hide domain={[0, 100]} />
								<Tooltip
									contentStyle={{
										backgroundColor: darkMode ? '#292524' : 'rgba(255, 255, 255, 0.98)',
										border: 'none',
										borderRadius: '12px',
										boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
										color: darkMode ? '#f5f5f4' : '#1F2937'
									}}
								/>
								<Area type="monotone" dataKey="level" stroke="#fb923c" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm">
					<h3 className="text-lg font-bold text-[#2C2420] dark:text-stone-100 mb-4">Sleep Stages</h3>
					<div className="h-64 w-full flex items-center justify-center">
						<p className="text-[#8B7355] dark:text-stone-400">Sleep stage analysis unlocked.</p>
					</div>
				</div>
			</div>
		</div>
	);

	const renderDetailView = () => (
		<div className="px-8 pb-8">
			<button onClick={() => setViewMode('home')} className="mb-6 flex items-center gap-2 text-[#8B7355] hover:text-[#2C2420] transition-colors">
				<ArrowLeft className="w-4 h-4" />
				Back to Dashboard
			</button>
			<div className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-sm border border-[#E8E3DC] dark:border-stone-700 min-h-[400px] flex items-center justify-center">
				<p className="text-[#8B7355] dark:text-stone-400">Detailed analysis view coming soon...</p>
			</div>
		</div>
	);

	return (
		<div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-stone-900' : 'bg-[#FDFBF7]'}`}>
			{showSplash && (
				<div className={`fixed inset-0 z-[100] flex items-center justify-center ${darkMode ? 'bg-stone-900' : 'bg-[#FDFBF7]'}`}>
					<div className="flex flex-col items-center animate-pulse">
						<h1 className="text-6xl font-bold text-[#2C2420] dark:text-stone-100 tracking-tight">StressAtlas</h1>
					</div>
				</div>
			)}

			{!isLoggedIn ? (
				<Login onLogin={() => { setIsLoggedIn(true); setShowSplash(true); }} />
			) : (
				<>
					<div className="w-20 bg-[#2C2420] dark:bg-[#1c1917] flex flex-col items-center py-8 gap-6 sticky top-0 h-screen transition-colors duration-300">
						<div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
							<BrandLogo className="w-10 h-10 text-white" />
						</div>

						<div className="flex flex-col gap-4">
							{visibleSidebarItems.map((item) => {
								const IconComponent = item.icon;
								return (
									<button
										key={item.id}
										onClick={() => {
											setActiveTab(item.id);
											setCurrentView('dashboard');
											setViewMode('home');
											if (item.id === 'chat') setIsChatOpen(true);
										}}
										className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeTab === item.id
											? 'bg-amber-500 text-white shadow-lg'
											: 'bg-[#3d332e] text-amber-200 hover:bg-[#4a3f39]'
											}`}
									>
										<IconComponent className="w-5 h-5" />
									</button>
								);
							})}
						</div>

						<div className="flex-1" />

						<button onClick={() => setDarkMode(!darkMode)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#8B7355] hover:bg-[#3d332e] hover:text-amber-200 transition-all duration-300 mb-2">
							{darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
						</button>

						<button
							onClick={() => setCurrentView('settings')}
							className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${currentView === 'settings'
								? 'bg-amber-500 text-white ring-4 ring-amber-500/30'
								: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:scale-105'
								}`}
						>
							{userName.charAt(0)}
						</button>
					</div>

					<div className="flex-1 overflow-y-auto">
						{activeTab !== 'healthdata' && (
							<div className="px-8 py-6 flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold text-[#2C2420] dark:text-stone-100">
										{viewMode === 'home' ? `Hello, ${userName}! 👋` : 'Sleep Deep Dive'}
									</h1>
									<p className="text-sm text-[#8B7355] mt-1">
										{viewMode === 'home' ? 'Welcome back to your wellness journey' : 'Detailed correlation analysis'}
									</p>
								</div>
								<div className="flex items-center gap-4">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
										<input
											type="text"
											placeholder="Search..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 pr-4 py-2 bg-white rounded-2xl border border-[#E8E3DC] focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm w-64"
										/>

										{searchQuery && filteredNav.length > 0 && (
											<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-[#E8E3DC] dark:border-stone-700 overflow-hidden z-50">
												{filteredNav.map((item) => (
													<button
														key={item.id}
														onClick={() => handleNavSearchClick(item)}
														className="w-full text-left px-4 py-3 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 flex items-center gap-3 transition-colors"
													>
														<div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
															<item.icon className="w-4 h-4" />
														</div>
														<div>
															<p className="text-sm font-medium text-[#2C2420] dark:text-stone-100">{item.label}</p>
															<p className="text-xs text-[#8B7355] dark:text-stone-400">
																Matches: {item.keywords.filter(k => k.includes(searchQuery.toLowerCase())).slice(0, 2).join(', ')}
															</p>
														</div>
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{currentView === 'settings' ? (
							<SettingsView onLogout={() => setIsLoggedIn(false)} />
						) : activeTab === 'healthdata' ? (
							<div className="px-8 py-6">
								<div className="mb-6">
									<h1 className="text-3xl font-bold text-[#2C2420]">Health Data</h1>
									<p className="text-sm text-[#8B7355] mt-1">Comprehensive health metrics and correlations</p>
								</div>
								{renderHealthDataView()}
							</div>
						) : activeTab === 'medicalvitals' ? (
							<div className="px-8 py-6">
								<div className="mb-6">
									<h1 className="text-3xl font-bold text-[#2C2420]">Medical Vitals</h1>
									<p className="text-sm text-[#8B7355] mt-1">Clinical health metrics and raw data</p>
								</div>
								{renderMedicalVitalsView()}
							</div>
						) : activeTab === 'relief' ? (
							<StressRelief />
						) : activeTab === 'calendar' ? (
							<CalendarJournal />
						) : (
							viewMode === 'home' ? renderHomeView() : renderDetailView()
						)}
					</div>

					{isChatOpen && (
						<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
							<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
								<div className="bg-gradient-to-r from-purple-400 to-purple-500 px-6 py-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
											<MessageCircle className="w-5 h-5 text-white" />
										</div>
										<div>
											<h3 className="text-white font-semibold text-lg">AI Assistant</h3>
											<p className="text-purple-100 text-xs">Always here to help</p>
										</div>
									</div>
									<button onClick={() => setIsChatOpen(false)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
										<X className="w-5 h-5 text-white" />
									</button>
								</div>

								<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFBF7]">
									{chatMessages.map((message, index) => (
										<div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
											<div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
												? 'bg-gradient-to-br from-purple-400 to-purple-500 text-white'
												: 'bg-white border border-[#E8E3DC] text-[#2C2420]'
												}`}>
												<p className="text-sm leading-relaxed">{message.content}</p>
											</div>
										</div>
									))}
									{isTyping && (
										<div className="flex justify-start">
											<div className="bg-white border border-[#E8E3DC] rounded-2xl px-4 py-3">
												<div className="flex gap-1">
													<div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
													<div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
													<div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
												</div>
											</div>
										</div>
									)}
								</div>

								<div className="p-4 bg-white border-t border-[#E8E3DC]">
									<div className="flex gap-2">
										<input
											type="text"
											value={messageInput}
											onChange={(e) => setMessageInput(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
											placeholder="Type your message..."
											className="flex-1 px-4 py-3 bg-[#F5F3EF] rounded-xl border border-[#E8E3DC] focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
										/>
										<button
											onClick={handleSendMessage}
											className="px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
										>
											<Send className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default App;
