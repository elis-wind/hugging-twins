import MascotBrain from './MascotBrain';
import MascotHeart from './MascotHeart';

const MascotDuo = () => {
  return (
    <div className="flex justify-center items-center gap-6">
      {/* Left Mascot - "The Mind" (Cool Tone) */}
      <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
        <div className="w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-400/20 p-2">
          <MascotBrain className="w-24 h-24" />
        </div>
        <p className="text-sm font-semibold text-blue-600 mt-3">Mind</p>
      </div>

      {/* Right Mascot - "The Pulse" (Warm Tone) */}
      <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
        <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-400/20 p-2">
          <MascotHeart className="w-24 h-24" />
        </div>
        <p className="text-sm font-semibold text-orange-600 mt-3">Pulse</p>
      </div>
    </div>
  );
};

export default MascotDuo;
