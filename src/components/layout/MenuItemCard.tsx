/**
 * This component displays a single menu item as a card.
 * 
 * It shows:
 * - The pizza image (clickable to zoom).
 * - Name, description, and price.
 * - "Add to Cart" button.
 * 
 * If the item has customization options (sizes/toppings), clicking "Add to Cart"
 * opens a popup to let the user choose before adding.
 */

"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Cart from "../icons/Cart";
import { CartContext } from "../CartProvider";
import { MenuItemCardProps } from "@/types/menu";
import ProductCustomizationModal from "@/components/menu/ProductCustomizationModal";

const MenuItemCard = React.memo(({ item, onImageClick }: MenuItemCardProps) => {
    const { addToCart } = useContext(CartContext);
    const [showModal, setShowModal] = useState(false);

    const hasOptions = (item.sizeOptions?.length ?? 0) > 0 || (item.extraIngredients?.length ?? 0) > 0;

    const handleAddToCartClick = () => {
        if (hasOptions) {
            setShowModal(true);
        } else {
            addToCart({
                ...item,
                size: null,
                extras: [],
            }); // Cast to CartProduct locally if needed, but structure matches enough
            toast.success(`${item.name} added to cart!`);
        }
    };

    const handleModalConfirm = (size: { name: string; extraPrice: number } | null, extras: { name: string; extraPrice: number }[]) => {
        addToCart(item, size, extras);
        toast.success(`${item.name} added to cart!`);
        setShowModal(false);
    };

    return (
        <>
            <div className="bg-[#16100a]/90 backdrop-blur-md border border-amber-900/40 hover:border-amber-500/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-orange-950/40 transition-all duration-300 transform hover:-translate-y-1.5 h-full flex flex-col group">
                <div
                    className="relative h-56 overflow-hidden cursor-pointer"
                    onClick={onImageClick}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-[#16100a] via-transparent to-transparent z-10 opacity-90 group-hover:opacity-60 transition-opacity" />

                    {/* Price & Discount Badges */}
                    <div className="absolute top-4 right-4 z-20">
                        {item.discountPrice && item.discountPrice < item.basePrice ? (
                            <div className="flex flex-col items-end gap-1.5">
                                <div className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-lg border border-emerald-400/30">
                                    {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
                                </div>
                                <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white text-sm font-extrabold px-3.5 py-1 rounded-full shadow-xl border border-amber-400/30">
                                    <span className="line-through text-xs opacity-75 mr-1">₹{item.basePrice}</span>
                                    ₹{item.discountPrice}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white text-sm font-extrabold px-3.5 py-1 rounded-full shadow-xl border border-amber-400/30">
                                ₹{item.basePrice}
                            </div>
                        )}
                    </div>

                    <Image
                        src={item.imageUrl || "/hero-pizza.webp"}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                <div className="p-5 flex flex-col grow">
                    <h3 className="text-xl font-bold text-amber-100 mb-2 truncate group-hover:text-amber-400 transition-colors" title={item.name}>
                        {item.name}
                    </h3>

                    <p className="text-amber-200/70 mb-5 text-sm line-clamp-2 grow leading-relaxed">
                        {item.description}
                    </p>

                    <button
                        className="w-full bg-linear-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] shadow-lg shadow-orange-950/50 active:scale-95 border border-orange-400/20"
                        onClick={handleAddToCartClick}
                    >
                        <Cart />
                        Add to Cart
                    </button>
                </div>
            </div>

            {showModal && (
                <ProductCustomizationModal
                    item={item}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleModalConfirm}
                />
            )}
        </>
    );
});

MenuItemCard.displayName = "MenuItemCard";

export default MenuItemCard;
