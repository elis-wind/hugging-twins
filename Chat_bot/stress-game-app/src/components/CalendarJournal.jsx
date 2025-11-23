import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Save, Calendar as CalendarIcon } from 'lucide-react';

const CalendarJournal = () => {
	const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
	const [selectedDate, setSelectedDate] = useState(null);
	const [entries, setEntries] = useState({
		'2025-11-14': { note: 'Big presentation, stress level 8/10. Felt overwhelmed but managed to get through it.', score: 80 },
		'2025-11-10': { note: 'Relaxing Sunday. Went for a long walk.', score: 20 },
		'2025-11-20': { note: 'Deadline approaching. focused but tired.', score: 65 },
	});
	const [noteInput, setNoteInput] = useState('');

	// Calendar Logic
	const getDaysInMonth = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const days = new Date(year, month + 1, 0).getDate();
		const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

		// Adjust for Monday start
		const startDay = firstDay === 0 ? 6 : firstDay - 1;

		return { days, startDay };
	};

	const { days, startDay } = getDaysInMonth(currentDate);

	const handlePrevMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
	};

	const handleDateClick = (day) => {
		const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		setSelectedDate(dateStr);
		setNoteInput(entries[dateStr]?.note || '');
	};

	const handleSaveEntry = () => {
		if (!selectedDate) return;

		setEntries(prev => ({
			...prev,
			[selectedDate]: {
				...prev[selectedDate],
				note: noteInput,
				score: prev[selectedDate]?.score || Math.floor(Math.random() * 100) // Mock score if new
			}
		}));
		setSelectedDate(null);
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
	};

	return (
		<div className="px-8 pb-8 h-full flex flex-col">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-[#2C2420] dark:text-stone-100">Journal Calendar</h1>
					<p className="text-sm text-[#8B7355] dark:text-stone-400 mt-1">Track your daily stress and thoughts</p>
				</div>

				{/* Month Navigation */}
				<div className="flex items-center gap-4 bg-white dark:bg-stone-800 p-2 rounded-2xl shadow-sm border border-[#E8E3DC] dark:border-stone-700">
					<button onClick={handlePrevMonth} className="p-2 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 rounded-xl transition-colors">
						<ChevronLeft className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
					</button>
					<span className="text-lg font-bold text-[#2C2420] dark:text-stone-100 min-w-[140px] text-center">
						{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
					</span>
					<button onClick={handleNextMonth} className="p-2 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 rounded-xl transition-colors">
						<ChevronRight className="w-5 h-5 text-[#2C2420] dark:text-stone-200" />
					</button>
				</div>
			</div>

			{/* Calendar Grid */}
			<div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-[#E8E3DC] dark:border-stone-700 flex-1 flex flex-col">
				{/* Weekday Headers */}
				<div className="grid grid-cols-7 mb-4">
					{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
						<div key={day} className="text-center text-sm font-semibold text-[#8B7355] dark:text-stone-400 uppercase tracking-wider">
							{day}
						</div>
					))}
				</div>

				{/* Days */}
				<div className="grid grid-cols-7 grid-rows-5 gap-2 flex-1">
					{/* Empty slots for start of month */}
					{Array.from({ length: startDay }).map((_, i) => (
						<div key={`empty-${i}`} />
					))}

					{/* Days of the month */}
					{Array.from({ length: days }).map((_, i) => {
						const day = i + 1;
						const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
						const entry = entries[dateStr];
						const isToday = day === 22 && currentDate.getMonth() === 10 && currentDate.getFullYear() === 2025; // Mock "Today" as Nov 22, 2025

						return (
							<button
								key={day}
								onClick={() => handleDateClick(day)}
								className={`
                  relative rounded-2xl border transition-all duration-200 flex flex-col items-start justify-between p-3
                  ${isToday
										? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
										: 'bg-white dark:bg-stone-800 border-[#E8E3DC] dark:border-stone-700 hover:border-amber-300 dark:hover:border-stone-500 hover:shadow-md'
									}
                `}
							>
								<span className={`text-sm font-semibold ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-[#2C2420] dark:text-stone-200'}`}>
									{day}
								</span>

								{entry && (
									<div className="w-full mt-2">
										<div className="flex items-center gap-1 mb-1">
											<div className={`w-2 h-2 rounded-full ${entry.score > 70 ? 'bg-red-400' : entry.score > 40 ? 'bg-orange-400' : 'bg-green-400'}`} />
											<span className="text-[10px] text-[#8B7355] dark:text-stone-400">Score: {entry.score}</span>
										</div>
										<p className="text-[10px] text-[#8B7355] dark:text-stone-500 line-clamp-2 text-left">
											{entry.note}
										</p>
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Journal Entry Modal */}
			{selectedDate && (
				<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
						{/* Header */}
						<div className="bg-[#FDFBF7] dark:bg-stone-800 px-6 py-4 border-b border-[#E8E3DC] dark:border-stone-700 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
									<CalendarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-[#2C2420] dark:text-stone-100">Daily Journal</h3>
									<p className="text-xs text-[#8B7355] dark:text-stone-400">{formatDate(selectedDate)}</p>
								</div>
							</div>
							<button
								onClick={() => setSelectedDate(null)}
								className="w-8 h-8 hover:bg-[#E8E3DC] dark:hover:bg-stone-700 rounded-full flex items-center justify-center transition-colors"
							>
								<X className="w-5 h-5 text-[#8B7355] dark:text-stone-400" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							{/* Stress Score Indicator */}
							<div className="mb-6 flex items-center justify-between bg-[#F5F3EF] dark:bg-stone-800 p-4 rounded-2xl">
								<span className="text-sm font-medium text-[#2C2420] dark:text-stone-200">Stress Score</span>
								<div className="flex items-center gap-2">
									<div className={`text-2xl font-bold ${(entries[selectedDate]?.score || 0) > 70 ? 'text-red-500' :
											(entries[selectedDate]?.score || 0) > 40 ? 'text-orange-500' : 'text-green-500'
										}`}>
										{entries[selectedDate]?.score || '--'}
									</div>
									<span className="text-xs text-[#8B7355] dark:text-stone-500">/100</span>
								</div>
							</div>

							{/* Note Input */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-[#2C2420] dark:text-stone-200 mb-2">
									Your Notes
								</label>
								<textarea
									value={noteInput}
									onChange={(e) => setNoteInput(e.target.value)}
									placeholder="How did you feel today? What triggered your stress?"
									className="w-full px-4 py-3 bg-[#F5F3EF] dark:bg-stone-800 rounded-2xl border border-[#E8E3DC] dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-[#2C2420] dark:text-stone-100 placeholder-[#8B7355] dark:placeholder-stone-500 resize-none h-32"
								/>
							</div>

							{/* Actions */}
							<div className="flex justify-end gap-3">
								<button
									onClick={() => setSelectedDate(null)}
									className="px-4 py-2 text-sm font-medium text-[#8B7355] dark:text-stone-400 hover:text-[#2C2420] dark:hover:text-stone-200 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleSaveEntry}
									className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
								>
									<Save className="w-4 h-4" />
									Save Entry
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CalendarJournal;
