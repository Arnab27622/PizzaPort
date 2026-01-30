/**
 * This component is a big form that Admins use to add new Pizzas or edit existing ones.
 * It lets them change the name, price, description, image, sizes, and extra toppings.
 */

import React, { useEffect } from 'react';
import Image from 'next/image';
import { MenuItemFormProps } from '@/types/menu';
import { useMenuItemForm } from '@/hooks/useMenuItemForm';
import MenuItemOptionFields from './MenuItemOptionFields';

export default function MenuItemForm({ item, onClose, onSuccess }: MenuItemFormProps) {
    // This custom hook handles all the form logic (typing, uploading images, saving)
    const {
        form,
        isSubmitting,
        initializeForm,
        handleChange,
        handleFileChange,
        handleOptionChange,
        addOption,
        removeOption,
        handleSubmit
    } = useMenuItemForm({ onSuccess, onClose });

    // If we are editing an existing item, load its data into the form
    useEffect(() => {
        initializeForm(item || undefined);
    }, [item, initializeForm]);

    // Handle ESC key to close the form
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 pt-28 z-50 backdrop-blur-xs">
            <div className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-md sm:max-w-lg p-6 overflow-auto max-h-[90vh] no-scrollbar shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-3">
                    <h3 className="text-2xl font-semibold text-amber-50">
                        {item ? "Edit Item" : "New Menu Item"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-2xl leading-none cursor-pointer"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Item Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="E.g. Pepperoni Pizza"
                                required
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Category</label>
                                <input
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="E.g. Pizza"
                                    required
                                    className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Base Price (₹)</label>
                                <input
                                    name="basePrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.basePrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                Discount Price (₹) <span className="text-xs text-gray-400">(Optional - for sales/promotions)</span>
                            </label>
                            <input
                                name="discountPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.discountPrice}
                                onChange={handleChange}
                                placeholder="Leave empty for no discount"
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                            />
                            {form.discountPrice && parseFloat(form.discountPrice) > 0 && parseFloat(form.basePrice) > 0 && (
                                <p className="text-xs mt-1 text-green-400">
                                    {parseFloat(form.discountPrice) < parseFloat(form.basePrice)
                                        ? `${Math.round(((parseFloat(form.basePrice) - parseFloat(form.discountPrice)) / parseFloat(form.basePrice)) * 100)}% OFF - Customers save ₹${(parseFloat(form.basePrice) - parseFloat(form.discountPrice)).toFixed(2)}`
                                        : 'Discount price should be less than base price'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Item description..."
                                rows={3}
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden resize-none"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-[#2F3234] p-3 rounded-md border border-dashed border-gray-600">
                        <label className="block text-sm text-gray-300 mb-2">Item Image</label>
                        <div className="flex items-start gap-4">
                            <div className="grow">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                                />
                            </div>
                            {form.imagePreview && (
                                <div className="shrink-0 relative w-20 h-20 rounded-md overflow-hidden border border-gray-500">
                                    <Image
                                        src={form.imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4 border-t border-gray-7 pt-4">
                        <MenuItemOptionFields
                            label="Sizes"
                            options={form.sizeOptions}
                            onChange={(idx, field, val) => handleOptionChange("sizeOptions", idx, field, val)}
                            onRemove={(idx) => removeOption("sizeOptions", idx)}
                            onAdd={() => addOption("sizeOptions")}
                        />

                        <MenuItemOptionFields
                            label="Extra Ingredients"
                            options={form.extraIngredients}
                            onChange={(idx, field, val) => handleOptionChange("extraIngredients", idx, field, val)}
                            onRemove={(idx) => removeOption("extraIngredients", idx)}
                            onAdd={() => addOption("extraIngredients")}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-600">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-md border border-gray-500 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-linear-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white rounded-md font-medium shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Saving...
                                </>
                            ) : (
                                item ? "Update Item" : "Create Item"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

