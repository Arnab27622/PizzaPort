import React from "react";
import Image from "next/image";

interface SharedImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

const SharedImageModal: React.FC<SharedImageModalProps> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div className="relative w-full max-w-xs sm:max-w-md h-72 sm:h-96">
                <Image
                    src={imageUrl}
                    alt="Full size view"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    priority
                />
            </div>
            <button
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default SharedImageModal;
