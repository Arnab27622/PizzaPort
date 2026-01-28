"use client";

import React from "react";
import { confirmable, createConfirmation, type ConfirmDialogProps } from "react-confirm";
import { CustomConfirmProps } from "@/types/common";

type Props = ConfirmDialogProps<CustomConfirmProps, boolean>;

/**
 * A confirmation dialog component for delete operations
 * 
 * @component
 * @param {Props} props - Component properties
 * @param {boolean} props.show - Controls dialog visibility
 * @param {Function} props.proceed - Callback to resolve the confirmation promise
 * @param {string} props.message - The confirmation message to display
 * 
 * @example
 * const result = await confirm({
 *   message: "Are you sure you want to delete this item?"
 * });
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
 * Opens a confirmation dialog and returns a promise that resolves to a boolean
 * 
 * @function
 * @param {CustomConfirmProps} props - Dialog properties
 * @param {string} props.message - The confirmation message to display
 * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
 * 
 * @example
 * const userConfirmed = await confirm({
 *   message: "Are you sure you want to delete this item?"
 * });
 * 
 * if (userConfirmed) {
 *   // Perform delete operation
 * }
 */
export const confirm = (props: CustomConfirmProps): Promise<boolean> => {
    return confirmInstance(props as Props);
};

export const ConfirmDelete = ConfirmDialog;