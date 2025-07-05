import React from 'react';

interface GameModeToggleProps {
    label: string;
    title: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const GameModeToggle: React.FC<GameModeToggleProps> = ({ label, title, checked, onChange, className = '' }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
        e.currentTarget.blur();
    };

    return (
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors" title={title}>
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className={`form-checkbox bg-slate-700 border-slate-600 focus:ring-offset-slate-900 ${className}`}
            />
            {label}
        </label>
    );
};

export default GameModeToggle;
