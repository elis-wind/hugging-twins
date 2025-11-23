import React, { useState } from 'react';
import { User, ShieldCheck, Link, LogOut, Activity, Watch, Calendar, ChevronRight, Crown } from 'lucide-react';

const SettingsView = ({ onLogout }) => {
	const [activeTab, setActiveTab] = useState('integrations'); // Default to integrations as requested priority

	const tabs = [
		{ id: 'profile', label: 'My Profile', icon: User },
		{ id: 'subscription', label: 'Subscription', icon: Crown },
		{ id: 'security', label: 'Security', icon: ShieldCheck },
		{ id: 'integrations', label: 'Integrations', icon: Link },
		{ id: 'signout', label: 'Sign Out', icon: LogOut, isDanger: true },
	];

	const renderContent = () => {
		switch (activeTab) {
			case 'subscription':
				return (
					<div className="space-y-6">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100">Subscription Plan</h2>
							<p className="text-[#8B7355] dark:text-stone-400 text-sm mt-1">Manage your billing and premium features</p>
						</div>

						<div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm transition-colors duration-300 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

							<div className="relative z-10">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
										<Crown className="w-8 h-8 text-white" />
									</div>
									<div>
										<h3 className="text-xl font-bold text-[#2C2420] dark:text-stone-100">Free Plan</h3>
										<p className="text-sm text-[#8B7355] dark:text-stone-400">Basic features active</p>
									</div>
								</div>

								<div className="space-y-4 mb-8">
									<div className="flex items-center gap-3 text-[#2C2420] dark:text-stone-200">
										<div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
											<div className="w-2 h-2 bg-green-500 rounded-full" />
										</div>
										<span className="text-sm">Basic health tracking</span>
									</div>
									<div className="flex items-center gap-3 text-[#2C2420] dark:text-stone-200">
										<div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
											<div className="w-2 h-2 bg-green-500 rounded-full" />
										</div>
										<span className="text-sm">7-day history</span>
									</div>
									<div className="flex items-center gap-3 text-[#8B7355] dark:text-stone-500 opacity-75">
										<div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
											<div className="w-2 h-2 bg-stone-400 rounded-full" />
										</div>
										<span className="text-sm">AI personalized insights</span>
									</div>
								</div>

								<button className="w-full py-4 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none transition-all transform hover:scale-[1.02]">
									Subscribe to Premium
								</button>
								<p className="text-center text-xs text-[#8B7355] dark:text-stone-500 mt-4">
									Start your 14-day free trial. Cancel anytime.
								</p>
							</div>
						</div>
					</div>
				);

			case 'integrations':
				return (
					<div className="space-y-6">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100">Connected Apps</h2>
							<p className="text-[#8B7355] dark:text-stone-400 text-sm mt-1">Manage your data sources and device connections</p>
						</div>

						<div className="grid grid-cols-1 gap-4">
							{/* Apple Health */}
							<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm flex items-center justify-between transition-colors duration-300">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
										<Activity className="w-6 h-6 text-white" />
									</div>
									<div>
										<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Apple Health</h3>
										<p className="text-xs text-[#8B7355] dark:text-stone-400">Syncs steps, sleep, and heart rate</p>
									</div>
								</div>
								<button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold text-sm rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
									Connected
								</button>
							</div>

							{/* Shoot (Watch Tracker) */}
							<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm flex items-center justify-between transition-colors duration-300">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-md">
										<Watch className="w-6 h-6 text-white" />
									</div>
									<div>
										<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Shoot Tracker</h3>
										<p className="text-xs text-[#8B7355] dark:text-stone-400">Wearable device integration</p>
									</div>
								</div>
								<button className="px-6 py-2 bg-[#2C2420] dark:bg-stone-700 hover:bg-[#4a3f39] dark:hover:bg-stone-600 text-white font-semibold text-sm rounded-xl transition-colors">
									Connect
								</button>
							</div>

							{/* Google Calendar */}
							<div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm flex items-center justify-between transition-colors duration-300">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
										<Calendar className="w-6 h-6 text-white" />
									</div>
									<div>
										<h3 className="font-bold text-[#2C2420] dark:text-stone-100">Google Calendar</h3>
										<p className="text-xs text-[#8B7355] dark:text-stone-400">Import schedule for stress correlation</p>
									</div>
								</div>
								<button className="px-6 py-2 bg-[#2C2420] dark:bg-stone-700 hover:bg-[#4a3f39] dark:hover:bg-stone-600 text-white font-semibold text-sm rounded-xl transition-colors">
									Connect
								</button>
							</div>
						</div>
					</div>
				);

			case 'security':
				return (
					<div className="space-y-6">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100">Security Settings</h2>
							<p className="text-[#8B7355] dark:text-stone-400 text-sm mt-1">Manage your password and account security</p>
						</div>

						<div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm space-y-6 transition-colors duration-300">
							<div className="space-y-4">
								<div>
									<label className="block text-xs font-bold text-[#8B7355] dark:text-stone-400 uppercase tracking-wider mb-2">Current Password</label>
									<input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#F5F3EF] dark:bg-stone-700 rounded-xl border border-[#E8E3DC] dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-[#2C2420] dark:text-stone-100 placeholder-stone-400" />
								</div>
								<div>
									<label className="block text-xs font-bold text-[#8B7355] dark:text-stone-400 uppercase tracking-wider mb-2">New Password</label>
									<input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#F5F3EF] dark:bg-stone-700 rounded-xl border border-[#E8E3DC] dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-[#2C2420] dark:text-stone-100 placeholder-stone-400" />
								</div>
							</div>

							<div className="pt-6 border-t border-[#E8E3DC] dark:border-stone-700 flex items-center justify-between">
								<div>
									<h4 className="font-bold text-[#2C2420] dark:text-stone-100">Two-Factor Authentication</h4>
									<p className="text-xs text-[#8B7355] dark:text-stone-400">Add an extra layer of security</p>
								</div>
								<div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-[#E8E3DC] dark:bg-stone-600">
									<span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200"></span>
								</div>
							</div>

							<div className="pt-4">
								<button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-orange-200 dark:shadow-none">
									Update Password
								</button>
							</div>
						</div>
					</div>
				);

			case 'profile':
				return (
					<div className="space-y-6">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#2C2420] dark:text-stone-100">My Profile</h2>
							<p className="text-[#8B7355] dark:text-stone-400 text-sm mt-1">Update your personal information</p>
						</div>

						<div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-[#E8E3DC] dark:border-stone-700 shadow-sm space-y-6 transition-colors duration-300">
							<div className="flex items-center gap-6 mb-6">
								<div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
									S
								</div>
								<button className="px-4 py-2 bg-[#F5F3EF] dark:bg-stone-700 hover:bg-[#E8E3DC] dark:hover:bg-stone-600 text-[#2C2420] dark:text-stone-200 font-semibold text-sm rounded-xl transition-colors">
									Change Photo
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-xs font-bold text-[#8B7355] dark:text-stone-400 uppercase tracking-wider mb-2">Full Name</label>
									<input type="text" defaultValue="Sarah Jenkins" className="w-full px-4 py-3 bg-[#F5F3EF] dark:bg-stone-700 rounded-xl border border-[#E8E3DC] dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-[#2C2420] dark:text-stone-100" />
								</div>
								<div>
									<label className="block text-xs font-bold text-[#8B7355] dark:text-stone-400 uppercase tracking-wider mb-2">Email Address</label>
									<input type="email" defaultValue="mo@stressatlas.com" className="w-full px-4 py-3 bg-[#F5F3EF] dark:bg-stone-700 rounded-xl border border-[#E8E3DC] dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-[#2C2420] dark:text-stone-100" />
								</div>
								<div className="md:col-span-2">
									<label className="block text-xs font-bold text-[#8B7355] dark:text-stone-400 uppercase tracking-wider mb-2">Bio</label>
									<textarea rows="3" defaultValue="Wellness enthusiast focused on improving sleep and reducing stress." className="w-full px-4 py-3 bg-[#F5F3EF] dark:bg-stone-700 rounded-xl border border-[#E8E3DC] dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-[#2C2420] dark:text-stone-100 resize-none"></textarea>
								</div>
							</div>

							<div className="pt-4">
								<button className="px-6 py-3 bg-[#2C2420] dark:bg-stone-700 hover:bg-[#4a3f39] dark:hover:bg-stone-600 text-white font-bold rounded-xl transition-colors">
									Save Changes
								</button>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="flex h-full gap-8 p-8">
			{/* Left Menu Column */}
			<div className="w-64 flex-shrink-0">
				<div className="bg-white dark:bg-stone-800 rounded-3xl p-4 shadow-sm border border-[#E8E3DC] dark:border-stone-700 h-full transition-colors duration-300">
					<div className="space-y-2">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							const isDanger = tab.isDanger;

							return (
								<button
									key={tab.id}
									onClick={() => {
										if (tab.id === 'signout') {
											onLogout();
										} else {
											setActiveTab(tab.id);
										}
									}}
									className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${isActive
										? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-200 font-semibold shadow-sm'
										: isDanger
											? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-medium'
											: 'text-[#8B7355] dark:text-stone-400 hover:bg-[#F5F3EF] dark:hover:bg-stone-700 hover:text-[#2C2420] dark:hover:text-stone-200 font-medium'
										}`}
								>
									<div className="flex items-center gap-3">
										<Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : isDanger ? 'text-orange-600 dark:text-orange-400' : 'text-[#8B7355] dark:text-stone-400'}`} />
										<span>{tab.label}</span>
									</div>
									{isActive && <ChevronRight className="w-4 h-4 text-orange-400" />}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Right Content Panel */}
			<div className="flex-1 h-full overflow-y-auto">
				{renderContent()}
			</div>
		</div>
	);
};

export default SettingsView;
