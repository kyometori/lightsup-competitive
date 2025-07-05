import React, { useEffect } from 'react';

interface ModalWrapperProps {
  onClose?: () => void;
  children: React.ReactNode;
  showAnimations: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ onClose, children, showAnimations, ariaLabelledBy, ariaDescribedBy, role = "dialog" }) => {
    useEffect(() => {
        if (!onClose) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    const animationClass = showAnimations ? 'animate-fade-in' : '';

    return (
        <div
            onClick={handleOverlayClick}
            className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 ${animationClass}`}
            role={role}
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
        >
            {children}
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

export default ModalWrapper;
