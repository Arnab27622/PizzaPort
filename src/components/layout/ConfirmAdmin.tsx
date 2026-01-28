"use client";

import React from 'react';
import { ConfirmModalProps } from '@/types/common';

/**
 * A reusable confirmation modal component for admin actions
 * 
 * @component
 * @param {ConfirmModalProps} props - Component properties
 * @param {boolean} props.show - Controls modal visibility
 * @param {() => void} props.onClose - Callback when modal is closed/cancelled
 * @param {() => void} props.onConfirm - Callback when action is confirmed
 * @param {string} props.message - The confirmation message to display
 * 
 * @example
 * <ConfirmModal
 *   show={isModalVisible}
 *   onClose={handleClose}
 *   onConfirm={handleConfirmAction}
 *   message="Are you sure you want to perform this action?"
 * />
 */
export default function ConfirmModal({ show, onClose, onConfirm, message }: ConfirmModalProps) {
    // Don't render if not visible
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-sm p-6 mx-3 space-y-4">
                <p>{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-[#CFB54F] hover:bg-[#CFB54F]/10 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-4 py-2 bg-[#FF5500] rounded hover:bg-[#e14a00] text-white cursor-pointer"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}