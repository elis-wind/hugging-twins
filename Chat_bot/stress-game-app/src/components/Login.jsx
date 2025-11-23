import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import CuteGreenHeartMascot from './CuteGreenHeartMascot';
import { ArrowRight, Mail, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		// In a real app, we would validate credentials here
		onLogin();
	};

	return (
		<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
			<div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

				{/* Left Side: Visuals & Mascot */}
				<div className="hidden md:flex flex-col items-center justify-center text-center space-y-6">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-orange-200/20 rounded-full blur-3xl transform scale-150"></div>
						<CuteGreenHeartMascot className="w-64 h-64 relative z-10" />
					</div>
					<div className="space-y-2 max-w-xs relative z-10">
						<h2 className="text-2xl font-bold text-[#2C2420]">Your Wellness Journey</h2>
						<p className="text-[#8B7355]">
							"Small steps every day lead to big changes over time. We're here to support you."
						</p>
					</div>
				</div>

				{/* Right Side: Login Form */}
				<div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-[#E8E3DC] relative overflow-hidden">
					{/* Decorative background element */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[4rem] -mr-8 -mt-8 z-0"></div>

					<div className="relative z-10">
						<div className="flex flex-col items-center mb-10">
							<div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3">
								<BrandLogo className="w-10 h-10 text-white" />
							</div>
							<h1 className="text-2xl font-bold text-[#2C2420]">Welcome to StressAtlas</h1>
							<p className="text-[#8B7355] text-sm mt-2">Sign in to continue your progress</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-1">
								<label className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider ml-1">Email Address</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<Mail className="h-5 w-5 text-[#8B7355] group-focus-within:text-orange-500 transition-colors" />
									</div>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="block w-full pl-11 pr-4 py-3.5 bg-[#F5F3EF] border border-[#E8E3DC] rounded-xl text-[#2C2420] placeholder-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
										placeholder="mo@stressatlas.com"
										required
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider ml-1">Password</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-[#8B7355] group-focus-within:text-orange-500 transition-colors" />
									</div>
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="block w-full pl-11 pr-4 py-3.5 bg-[#F5F3EF] border border-[#E8E3DC] rounded-xl text-[#2C2420] placeholder-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
										placeholder="••••••••"
										required
									/>
								</div>
							</div>

							<div className="flex items-center justify-between text-sm">
								<label className="flex items-center space-x-2 cursor-pointer group">
									<input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
									<span className="text-[#8B7355] group-hover:text-[#2C2420] transition-colors">Remember me</span>
								</label>
								<a href="#" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Forgot password?</a>
							</div>

							<button
								type="submit"
								className="w-full flex items-center justify-center gap-2 bg-[#fb923c] hover:bg-[#f97316] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-200 transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
							>
								<span>Sign In</span>
								<ArrowRight className="w-5 h-5" />
							</button>
						</form>

						<div className="mt-8 text-center">
							<p className="text-[#8B7355] text-sm">
								Don't have an account?{' '}
								<a href="#" className="text-orange-600 hover:text-orange-700 font-bold transition-colors">Create Account</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
