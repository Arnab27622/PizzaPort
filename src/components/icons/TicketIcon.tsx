import React from 'react';

export default function TicketIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M2.25 9.75h1.5a1.5 1.5 0 0 0 1.5-1.5V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21.75 6v2.25a1.5 1.5 0 0 0 1.5 1.5h1.5m-21 4.5h1.5a1.5 1.5 0 0 1 1.5 1.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 19.5 18v-2.25a1.5 1.5 0 0 1 1.5-1.5h1.5m-21-4.5v4.5m21-4.5v4.5"
            />
        </svg>
    );
}
