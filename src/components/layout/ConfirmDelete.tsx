"use client";

import React from "react";
import { confirmable, createConfirmation, type ConfirmDialogProps } from "react-confirm";
import { CustomConfirmProps } from "@/types/common";
import TrashIcon from "../icons/TrashIcon";

type Props = ConfirmDialogProps<CustomConfirmProps, boolean>;

/**
 * A popup that asks "Are you sure you want to delete this?"
 * Shows Cancel and Delete buttons with wood-fired theme styling.
 */
const ConfirmDialog: React.FC<Props> = ({ show, proceed, message }) => {
    if (!show) return null;
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fadeIn"
            onClick={() => proceed(false)}
        >
            <div
                className="bg-[#18120c]/95 border border-amber-900/60 text-amber-50 rounded-2xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-xl transform transition-all relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Subtle Amber/Red Ambient Glow Overlay */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header Icon + Title */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-red-500 shadow-inner">
                        <TrashIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-extrabold text-amber-100 tracking-tight">Confirm Deletion</h3>
                        <p className="text-xs text-amber-400/70 font-medium">This action cannot be undone.</p>
                    </div>
                </div>

                {/* Main Message */}
                <p className="text-amber-200/90 text-sm sm:text-base leading-relaxed bg-[#120d08]/80 p-4 rounded-xl border border-amber-900/30 font-medium">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        onClick={() => proceed(false)}
                        className="px-5 py-2.5 rounded-xl border border-amber-800/40 text-amber-300 hover:text-white hover:bg-amber-900/30 hover:border-amber-700/60 transition-all font-bold text-sm cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => proceed(true)}
                        className="px-5 py-2.5 bg-linear-to-r from-red-600 to-amber-700 hover:from-red-500 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-red-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                    >
                        Delete Item
                    </button>
                </div>
            </div>
        </div>
    );
};

// Create confirmation function with proper typing
const confirmInstance = createConfirmation(confirmable(ConfirmDialog));

/**
 * Shows a confirmation dialog before deleting something.
 * Returns true if user clicks "Delete", false if they click "Cancel".
 */
export const confirm = (props: CustomConfirmProps): Promise<boolean> => {
    return confirmInstance(props as Props);
};

export const ConfirmDelete = ConfirmDialog;