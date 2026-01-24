import React, { useState } from 'react';
import Image from 'next/image';
import Cart from '@/components/icons/Cart';
import { MenuItem, Option } from '@/types/menu';

interface ProductCustomizationModalProps {
    item: MenuItem;
    onClose: () => void;
    onConfirm: (size: Option | null, extras: Option[]) => void;
}

export default function ProductCustomizationModal({
    item,
    onClose,
    onConfirm
}: ProductCustomizationModalProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

    const handleConfirm = () => {
        const size = item.sizeOptions?.find((s) => s.name === selectedSize) ?? null;
        const extras = item.extraIngredients?.filter((e) =>
            selectedExtras.includes(e.name)
        ) ?? [];
        onConfirm(size, extras);
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-md p-6 space-y-4 overflow-auto max-h-[90vh] no-scrollbar">
                <h2 className="text-2xl font-semibold">{item.name}</h2>

                {item.imageUrl && (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={480}
                        height={360}
                        className="w-full h-60 object-cover rounded-lg my-2"
                        priority
                    />
                )}

                {/* Size Options */}
                {item.sizeOptions?.length > 0 && (
                    <fieldset className="space-y-1">
                        <legend className="font-semibold text-amber-100">Choose Size:</legend>
                        {item.sizeOptions.map((sz) => {
                            const total = item.basePrice + sz.extraPrice;
                            return (
                                <label
                                    key={sz.name}
                                    className="flex items-center gap-2 text-amber-100 cursor-pointer py-1 px-2 hover:bg-white/5 rounded transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="size"
                                        value={sz.name}
                                        checked={selectedSize === sz.name}
                                        onChange={() => setSelectedSize(sz.name)}
                                        className="accent-primary w-4 h-4"
                                    />
                                    <span>
                                        {sz.name} (+₹{sz.extraPrice}) → ₹{total}
                                    </span>
                                </label>
                            );
                        })}
                    </fieldset>
                )}

                {/* Extra Ingredients */}
                {item.extraIngredients?.length > 0 && (
                    <fieldset className="space-y-1">
                        <legend className="font-semibold text-amber-100">Toppings:</legend>
                        {item.extraIngredients.map((ex) => (
                            <label
                                key={ex.name}
                                className="flex items-center gap-2 text-amber-100 cursor-pointer py-1 px-2 hover:bg-white/5 rounded transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    value={ex.name}
                                    checked={selectedExtras.includes(ex.name)}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedExtras((prev) =>
                                            prev.includes(val)
                                                ? prev.filter((x) => x !== val)
                                                : [...prev, val]
                                        );
                                    }}
                                    className="accent-primary w-4 h-4"
                                />
                                <span>
                                    {ex.name} (+₹{ex.extraPrice})
                                </span>
                            </label>
                        ))}
                    </fieldset>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-amber-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-[#CFB54F] hover:bg-[#CFB54F]/10 text-amber-100 cursor-pointer transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={item.sizeOptions?.length > 0 && selectedSize === null}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 flex gap-2 items-center cursor-pointer transition-colors shadow-lg"
                    >
                        <Cart />Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
