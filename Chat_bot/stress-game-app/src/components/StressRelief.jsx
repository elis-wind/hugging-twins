import React, { useState, useEffect } from 'react';
import { Heart, Moon, Sun, Star, Cloud, Zap, Umbrella, Anchor, RefreshCw } from 'lucide-react';

const StressRelief = () => {
	// --- Breathing Assistant Logic ---
	const [breathingState, setBreathingState] = useState('Inhale'); // 'Inhale', 'Hold', 'Exhale'
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const breathe = () => {
			setBreathingState('Inhale');
			setScale(1.5);
			setTimeout(() => {
				setBreathingState('Exhale');
				setScale(1);
			}, 4000);
		};

		breathe(); // Initial start
		const interval = setInterval(breathe, 8000); // 4s in, 4s out

		return () => clearInterval(interval);
	}, []);

	// --- Memory Game Logic ---
	const icons = [Heart, Moon, Sun, Star, Cloud, Zap, Umbrella, Anchor];
	const [cards, setCards] = useState([]);
	const [flipped, setFlipped] = useState([]);
	const [solved, setSolved] = useState([]);
	const [disabled, setDisabled] = useState(false);

	const shuffleCards = () => {
		const duplicatedIcons = [...icons, ...icons];
		const shuffled = duplicatedIcons
			.sort(() => Math.random() - 0.5)
			.map((Icon, index) => ({ id: index, Icon, isFlipped: false }));
		setCards(shuffled);
		setFlipped([]);
		setSolved([]);
	};

	useEffect(() => {
		shuffleCards();
	}, []);

	const handleCardClick = (id) => {
		if (disabled || solved.includes(id) || flipped.includes(id)) return;

		setFlipped((prev) => [...prev, id]);

		if (flipped.length === 1) {
			setDisabled(true);
			const firstId = flipped[0];
			const secondId = id;
			const firstCard = cards.find((c) => c.id === firstId);
			const secondCard = cards.find((c) => c.id === secondId);

			if (firstCard.Icon === secondCard.Icon) {
				setSolved((prev) => [...prev, firstId, secondId]);
				setFlipped([]);
				setDisabled(false);
			} else {
				setTimeout(() => {
					setFlipped([]);
					setDisabled(false);
				}, 1000);
			}
		}
	};

	return (
		<div className="px-8 pb-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-[#2C2420] dark:text-stone-100">Relief Zone</h1>
				<p className="text-sm text-[#8B7355] dark:text-stone-400 mt-1">Tools to reset and recharge your mind</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Tool A: Breathing Assistant */}
				<div className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-sm border border-[#E8E3DC] dark:border-stone-700 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden transition-colors duration-300">
					<div className="absolute top-6 left-6">
						<h3 className="text-xl font-semibold text-[#2C2420] dark:text-stone-100">Breathing Assistant</h3>
						<p className="text-sm text-[#8B7355] dark:text-stone-400">Follow the rhythm</p>
					</div>

					<div
						className="rounded-full bg-[#86efac] flex items-center justify-center shadow-lg transition-all duration-[4000ms] ease-in-out"
						style={{
							width: '150px',
							height: '150px',
							transform: `scale(${scale})`,
							opacity: breathingState === 'Inhale' ? 0.8 : 0.6
						}}
					>
						<span className="text-stone-800 font-bold text-lg transition-opacity duration-500">
							{breathingState === 'Inhale' ? 'Inhale...' : 'Exhale...'}
						</span>
					</div>

					<div className="mt-12 text-center text-[#8B7355] dark:text-stone-400 text-sm">
						Focus on the circle. Deep breaths.
					</div>
				</div>

				{/* Tool B: Mini Memory Game */}
				<div className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-sm border border-[#E8E3DC] dark:border-stone-700 flex flex-col min-h-[400px] transition-colors duration-300">
					<div className="flex justify-between items-start mb-6">
						<div>
							<h3 className="text-xl font-semibold text-[#2C2420] dark:text-stone-100">Mind Match</h3>
							<p className="text-sm text-[#8B7355] dark:text-stone-400">Find the pairs</p>
						</div>
						<button
							onClick={shuffleCards}
							className="p-2 bg-[#F5F3EF] dark:bg-stone-700 rounded-xl hover:bg-[#E8E3DC] dark:hover:bg-stone-600 transition-colors"
							title="Restart Game"
						>
							<RefreshCw className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
						</button>
					</div>

					<div className="grid grid-cols-4 gap-3 flex-1">
						{cards.map((card) => {
							const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
							const Icon = card.Icon;
							return (
								<button
									key={card.id}
									onClick={() => handleCardClick(card.id)}
									className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 transform ${isFlipped
											? 'bg-amber-400 rotate-y-180'
											: 'bg-[#F5F3EF] dark:bg-stone-700 hover:bg-[#E8E3DC] dark:hover:bg-stone-600'
										}`}
									disabled={isFlipped || disabled}
								>
									{isFlipped && <Icon className="w-6 h-6 text-white" />}
								</button>
							);
						})}
					</div>

					{solved.length === icons.length * 2 && (
						<div className="mt-4 text-center text-emerald-600 dark:text-emerald-400 font-bold animate-bounce">
							Great job! 🎉
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default StressRelief;
