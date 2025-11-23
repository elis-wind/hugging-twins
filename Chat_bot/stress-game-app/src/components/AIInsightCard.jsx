import React, { useState, useEffect } from 'react';
import CuteGreenHeartMascot from './CuteGreenHeartMascot';
import { Moon, Zap, Lightbulb } from 'lucide-react';

const AIInsightCard = ({ data }) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate loading delay for effect
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<div className="col-span-12 bg-white rounded-3xl p-8 shadow-sm border border-[#E8E3DC] min-h-[300px] flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<CuteGreenHeartMascot className="w-20 h-20 animate-bounce" />
					<p className="text-[#8B7355] font-medium animate-pulse">Analyzing your biometrics...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="col-span-12 bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-sm border border-[#E8E3DC] dark:border-stone-700 relative overflow-hidden transition-colors duration-300 min-h-[450px]">
			{/* Background Decoration */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

			<div className="relative z-10 flex items-start gap-8">
				{/* Left Column: Mascot & Greeting */}
				<div className="flex-shrink-0 w-1/4 flex flex-col items-center text-center border-r border-[#E8E3DC] dark:border-stone-700 pr-8">
					<div className="mb-4 relative">
						<div className="absolute inset-0 bg-green-200/20 dark:bg-green-900/20 rounded-full blur-xl animate-pulse" />
						<CuteGreenHeartMascot className="w-24 h-24" />
					</div>
					<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100 mb-1">
						{data?.greeting}
					</h2>
					<p className="text-sm text-[#8B7355] dark:text-stone-400">
						Daily Health Insight
					</p>
				</div>

				{/* Right Column: Insights & Actions */}
				<div className="flex-1 grid grid-cols-2 gap-6">
					{/* Insight 1: Sleep */}
					<div className="bg-[#F5F3EF] dark:bg-stone-700/50 rounded-2xl p-5 transition-colors">
						<div className="flex items-center gap-2 mb-2">
							<Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
							<h3 className="font-semibold text-[#2C2420] dark:text-stone-200 text-sm">Sleep Analysis</h3>
						</div>
						<p className="text-sm text-[#5A4E46] dark:text-stone-300 leading-relaxed">
							{data?.sleepInsight}
						</p>
					</div>

					{/* Insight 2: Stress */}
					<div className="bg-[#F5F3EF] dark:bg-stone-700/50 rounded-2xl p-5 transition-colors">
						<div className="flex items-center gap-2 mb-2">
							<Zap className="w-4 h-4 text-orange-500 dark:text-orange-400" />
							<h3 className="font-semibold text-[#2C2420] dark:text-stone-200 text-sm">Stress Triggers</h3>
						</div>
						<p className="text-sm text-[#5A4E46] dark:text-stone-300 leading-relaxed">
							{data?.stressContext}
						</p>
					</div>

					{/* Actionable Tip (Full Width) */}
					<div className="col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800/30 flex items-start gap-4">
						<div className="bg-white dark:bg-stone-800 p-2 rounded-xl shadow-sm">
							<Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-1">Recommended Action</h3>
							<p className="text-sm text-green-800 dark:text-green-200">
								{data?.actionableTip}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AIInsightCard;
