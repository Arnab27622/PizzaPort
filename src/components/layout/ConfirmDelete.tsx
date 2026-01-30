"use client";

import React from "react";
import { confirmable, createConfirmation, type ConfirmDialogProps } from "react-confirm";
import { CustomConfirmProps } from "@/types/common";

type Props = ConfirmDialogProps<CustomConfirmProps, boolean>;

/**
 * A popup that asks "Are you sure you want to delete this?"
 * Shows Cancel and Delete buttons.
 */
const ConfirmDialog: React.FC<Props> = ({ show, proceed, message }) => {
    if (!show) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={() => proceed(false)}
        >
            <div
                className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-sm p-6 space-y-4 mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => proceed(false)}
                        className="px-4 py-2 rounded border border-[#CFB54F] hover:bg-[#CFB54F]/10 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => proceed(true)}
                        className="px-4 py-2 bg-[#FF5500] rounded hover:bg-[#e14a00] text-white cursor-pointer"
                    >
                        Delete
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