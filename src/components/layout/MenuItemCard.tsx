"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Cart from "../icons/Cart";
import { CartContext } from "../CartProvider";
import { MenuItemCardProps } from "@/types/menu";
import ProductCustomizationModal from "@/components/menu/ProductCustomizationModal";

export default function MenuItemCard({ item, onImageClick }: MenuItemCardProps) {
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
            <div className="bg-linear-to-br from-[#2c1a0d] to-[#1a1108] border border-amber-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                <div
                    className="relative h-56 overflow-hidden cursor-pointer group"
                    onClick={onImageClick}
                >
                    <div className="absolute inset-0 bg-linear-to-t from-[#1a1108] via-transparent to-transparent z-10" />

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 z-20">
                        {item.discountPrice && item.discountPrice < item.basePrice ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                                    {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
                                </div>
                                <div className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                                    <span className="line-through text-xs opacity-75 mr-1">₹{item.basePrice}</span>
                                    ₹{item.discountPrice}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                                ₹{item.basePrice}
                            </div>
                        )}
                    </div>

                    <Image
                        src={item.imageUrl || "/hero-pizza.png"}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>

                <div className="p-4 flex flex-col grow">
                    <h3 className="text-xl font-bold text-amber-100 mb-2 truncate" title={item.name}>
                        {item.name}
                    </h3>

                    <p className="text-amber-200/80 mb-4 text-sm line-clamp-2 grow">
                        {item.description}
                    </p>

                    <button
                        className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] shadow-lg active:scale-95"
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
}
