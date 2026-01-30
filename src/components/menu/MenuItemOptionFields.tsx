/**
 * This helper component renders a list of inputs for "Sizes" or "Key Ingredients".
 * It allows the Admin to add as many options as they want (e.g., Small, Medium, Large).
 */

import React from 'react';
import { MenuItemOptionFieldsProps } from '@/types/menu';
import TrashIcon from '../icons/TrashIcon';

export default function MenuItemOptionFields({
    label,
    options,
    onChange,
    onRemove,
    onAdd
}: MenuItemOptionFieldsProps) {
    return (
        <div className="bg-[#2F3234] p-2 rounded-md mb-2">
            <h4 className="text-lg font-semibold text-gray-200 mb-2">{label}</h4>
            {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                    <input
                        placeholder="Name"
                        value={opt.name}
                        onChange={e => onChange(idx, "name", e.target.value)}
                        className="w-2/3 bg-[#1a1c1e] border border-[#555] text-[#F9FBF7] p-2 rounded focus:outline-hidden focus:border-amber-500"
                        required
                    />
                    <input
                        placeholder="Extra price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={opt.extraPrice}
                        onChange={e => onChange(idx, "extraPrice", e.target.value)}
                        className="w-1/3 bg-[#1a1c1e] border border-[#555] text-[#F9FBF7] p-2 rounded focus:outline-hidden focus:border-amber-500"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        className="text-red-500 hover:text-red-400 p-2 cursor-pointer transition-colors"
                        aria-label={`Remove ${label} option`}
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={onAdd}
                className="mt-1 text-sm bg-[#1a1c1e] text-primary px-3 py-1 rounded border border-primary/30 hover:bg-primary/10 transition-colors cursor-pointer"
            >
                + Add {label}
            </button>
        </div>
    );
}

