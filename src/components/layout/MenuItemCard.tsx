"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import Cart from "../icons/Cart";
import { CartContext } from "../AppContext";
import { toast } from "react-toastify";

/**
 * Interface representing a customizable option for menu items
 * @interface Option
 * @property {string} name - Display name of the option
 * @property {number} extraPrice - Additional cost for this option
 */
interface Option {
    name: string;
    extraPrice: number;
}

/**
 * Interface representing the properties of a menu item
 * @interface MenuItemCardProps
 * @property {string} _id - Unique identifier for the menu item
 * @property {string} name - Display name of the menu item
 * @property {string} description - Description of the menu item
 * @property {number} basePrice - Base price without any options
 * @property {string} [imageUrl] - Optional URL for the item's image
 * @property {Option[]} [sizeOptions] - Optional array of size options
 * @property {Option[]} [extraIngredients] - Optional array of extra ingredients/toppings
 */
interface MenuItemCardProps {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl?: string;
    sizeOptions?: Option[];
    extraIngredients?: Option[];
}

/**
 * MenuItemCard component for displaying individual menu items with add-to-cart functionality
 * 
 * @component
 * @description 
 * - Displays menu items in a card format with image, name, description, and price
 * - Handles both simple items and items with customization options (sizes, extras)
 * - Opens a modal for items with options to allow user customization
 * - Integrates with cart context for adding items to cart
 * - Provides image click functionality for enlarging images
 * - Includes toast notifications for user feedback
 * 
 * @param {Object} props - Component properties
 * @param {MenuItemCardProps} props.item - The menu item data to display
 * @param {() => void} props.onImageClick - Callback function when item image is clicked
 * 
 * @example
 * <MenuItemCard
 *   item={pizzaItem}
 *   onImageClick={handleImageClick}
 * />
 * 
 * @returns {JSX.Element} Menu item card with optional customization modal
 */
function MenuItemCard({
    item,
    onImageClick,
}: {
    item: MenuItemCardProps;
    onImageClick: () => void;
}) {
    // Access cart context for adding items
    const { addToCart } = useContext(CartContext);

    // State for modal visibility and user selections
    const [showModal, setShowModal] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

    /**
     * Determines if the item has any customization options
     * @type {boolean}
     */
    const itemHasOptions =
        (item.sizeOptions?.length ?? 0) > 0 ||
        (item.extraIngredients?.length ?? 0) > 0;

    /**
     * Handles the add to cart action
     * @function handleAdd
     * @returns {void}
     * 
     * @description
     * - For items with options: opens customization modal
     * - For simple items: directly adds to cart with toast notification
     */
    const handleAdd = () => {
        if (itemHasOptions) {
            setShowModal(true);
        } else {
            // Add simple item directly to cart
            addToCart({
                ...item,
                size: null,
                extras: [],
            });
            toast.success(`${item.name} added to cart!`);
        }
    };

    /**
     * Handles confirmation of customized item and adds to cart
     * @function handleConfirm
     * @returns {void}
     * 
     * @description
     * - Finds selected size and extras based on user selections
     * - Adds customized item to cart via context
     * - Shows success toast notification
     * - Resets modal state and user selections
     */
    const handleConfirm = () => {
        const size = item.sizeOptions?.find((s) => s.name === selectedSize) ?? null;
        const extras = item.extraIngredients?.filter((e) =>
            selectedExtras.includes(e.name)
        ) ?? [];
        addToCart(item, size, extras);
        toast.success(`${item.name} added to cart!`);
        setShowModal(false);
        setSelectedSize(null);
        setSelectedExtras([]);
    };

    return (
        <>
            {/* Main Menu Item Card */}
            <div className="bg-linear-to-br from-[#2c1a0d] to-[#1a1108] border border-amber-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Image Section with Overlay */}
                <div
                    className="relative h-56 overflow-hidden cursor-pointer"
                    onClick={onImageClick}
                    role="button"
                    aria-label={`View larger image of ${item.name}`}
                    tabIndex={0}
                >
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#1a1108] to-transparent z-10"></div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                        ₹{item.basePrice}
                    </div>

                    {/* Item Image */}
                    <Image
                        src={item.imageUrl || "/hero-pizza.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Content Section */}
                <div className="p-4">
                    {/* Item Name */}
                    <h3 className="text-xl font-bold text-amber-100 mb-2">{item.name}</h3>

                    {/* Item Description with line clamp for consistent height */}
                    <p className="text-amber-200 mb-4 text-sm line-clamp-2">
                        {item.description}
                    </p>

                    {/* Add to Cart Button */}
                    <button
                        className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                        onClick={handleAdd}
                        aria-label={`Add ${item.name} to cart`}
                    >
                        <Cart />
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Customization Modal for Items with Options */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-md p-6 space-y-4 overflow-auto max-h-[90vh] no-scrollbar">
                        {/* Modal Header */}
                        <h2 id="modal-title" className="text-2xl font-semibold">{item.name}</h2>

                        {/* Item Image in Modal */}
                        {item.imageUrl && (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                width={480}
                                height={360}
                                priority
                                className="w-full h-60 object-cover rounded-lg my-2"
                            />
                        )}

                        {/* Size Options Section */}
                        {item.sizeOptions?.length ? (
                            <fieldset className="space-y-1">
                                <legend className="font-semibold">Choose Size:</legend>
                                {item.sizeOptions.map((sz) => {
                                    const total = item.basePrice + sz.extraPrice;
                                    return (
                                        <label
                                            key={sz.name}
                                            className="flex items-center gap-2 text-amber-100"
                                        >
                                            <input
                                                type="radio"
                                                name="size"
                                                value={sz.name}
                                                checked={selectedSize === sz.name}
                                                onChange={() => setSelectedSize(sz.name)}
                                                className="accent-primary"
                                                aria-describedby={`size-${sz.name}-price`}
                                            />
                                            <span id={`size-${sz.name}-price`}>
                                                {sz.name} (+₹{sz.extraPrice}) → ₹{total}
                                            </span>
                                        </label>
                                    );
                                })}
                            </fieldset>
                        ) : null}

                        {/* Extra Ingredients/Toppings Section */}
                        {item.extraIngredients?.length ? (
                            <fieldset className="space-y-1">
                                <legend className="font-semibold">Toppings:</legend>
                                {item.extraIngredients.map((ex) => (
                                    <label
                                        key={ex.name}
                                        className="flex items-center gap-2 text-amber-100"
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
                                            className="accent-primary"
                                            aria-describedby={`extra-${ex.name}-price`}
                                        />
                                        <span id={`extra-${ex.name}-price`}>
                                            {ex.name} (+₹{ex.extraPrice})
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                        ) : null}

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-4 pt-2 border-t border-amber-700">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded border border-[#CFB54F] hover:bg-[#CFB54F]/10 text-amber-100 cursor-pointer"
                                aria-label="Cancel customization"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={
                                    item.sizeOptions?.length ? selectedSize === null : false
                                }
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 flex gap-2 items-center cursor-pointer"
                                aria-label={`Add customized ${item.name} to cart`}
                            >
                                <Cart />Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MenuItemCard;