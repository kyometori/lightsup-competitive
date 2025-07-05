import React from 'react';

interface CountdownSceneProps {
    countdownValue: number;
    showAnimations: boolean;
}

const CountdownScene: React.FC<CountdownSceneProps> = ({ countdownValue, showAnimations }) => {
    const animationClass = showAnimations ? 'animate-fade-in' : '';

    return (
        <div className={`fixed inset-0 bg-slate-900/80 flex items-center justify-center z-40 ${animationClass}`}>
            <div className="text-9xl font-bold text-white" style={showAnimations ? { animation: 'countdown-pulse 1s ease-out infinite' } : {}}>
                {countdownValue}
            </div>
        </div>
    );
};

export default CountdownScene;
