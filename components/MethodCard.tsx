'use client';

interface MethodCardProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export default function MethodCard({ icon, label, isActive, onClick }: MethodCardProps) {
    return (
        <button
            onClick={onClick}
            className={`
                p-6 border-2 rounded-xl flex flex-col items-center justify-center gap-2
                transition-all duration-150
                ${isActive
                ? 'border-blue-600 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
            `}
        >
            <span className="text-3xl" role="img" aria-hidden="true">
                {icon}
            </span>
            <span className="font-semibold text-gray-800 text-sm">
                {label}
            </span>
        </button>
    );
}