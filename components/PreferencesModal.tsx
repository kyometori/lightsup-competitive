import React, { useState } from 'react';
import { UserPreferences } from '../types.ts';
import { StopIcon } from './icons.tsx';

interface PreferencesModalProps {
  initialPreferences: UserPreferences;
  onSave: (newPreferences: UserPreferences) => void;
  onClose: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ initialPreferences, onSave, onClose }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPreferences);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrefs(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPrefs(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = () => {
    onSave(prefs);
    onClose();
  };

  const animationClass = initialPreferences.showAnimations ? 'animate-fade-in' : '';

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 ${animationClass}`}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-left border border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close preferences"
        >
          <StopIcon className="w-8 h-8" />
        </button>

        <h2 className="text-3xl font-bold text-yellow-400 mb-6">Display Preferences</h2>
        <p className="text-slate-400 mb-6">
          Customise your gameplay experience by hiding elements that you find distracting.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-4 cursor-pointer p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <input
              type="checkbox"
              name="showAnimations"
              checked={prefs.showAnimations}
              onChange={handleCheckboxChange}
              className="form-checkbox h-6 w-6 bg-slate-900 border-slate-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-800"
            />
            <span className="text-lg text-slate-200">Show Animations</span>
          </label>
          <label className="flex items-center gap-4 cursor-pointer p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <input
              type="checkbox"
              name="showTimers"
              checked={prefs.showTimers}
              onChange={handleCheckboxChange}
              className="form-checkbox h-6 w-6 bg-slate-900 border-slate-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-800"
            />
            <span className="text-lg text-slate-200">Show Timers</span>
          </label>
           <label className="flex items-center gap-4 cursor-pointer p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <input
              type="checkbox"
              name="showMoveStats"
              checked={prefs.showMoveStats}
              onChange={handleCheckboxChange}
              className="form-checkbox h-6 w-6 bg-slate-900 border-slate-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-800"
            />
            <span className="text-lg text-slate-200">Show Move Count</span>
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <span className="text-lg text-slate-200">Countdown</span>
            <select
                name="countdownSeconds"
                value={prefs.countdownSeconds}
                onChange={handleSelectChange}
                className="form-select bg-slate-900 border border-slate-600 text-slate-200 rounded-md py-1.5 px-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                aria-label="Countdown duration"
            >
                <option value="5">5 seconds</option>
                <option value="3">3 seconds</option>
                <option value="0">None</option>
            </select>
          </label>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Save & Close
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PreferencesModal;