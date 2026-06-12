'use client';

interface SidebarButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export default function SidebarButton({ label, isActive, onClick }: SidebarButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                whitespace-nowrap md:whitespace-normal text-left px-4 py-3 rounded-lg
                transition-all duration-150 text-sm font-medium
                ${isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }
            `}
        >
            {label}
        </button>
    );
}