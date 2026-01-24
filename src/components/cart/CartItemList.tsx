import React, { useCallback } from 'react';
import Image from 'next/image';
import TrashIcon from '@/components/icons/TrashIcon';
import { GroupedCartItem } from '@/types/cart';

interface CartItemListProps {
    groupedItems: GroupedCartItem[];
    onRemove: (index: number) => void;
}

export default function CartItemList({ groupedItems, onRemove }: CartItemListProps) {
    const getItemTotal = useCallback((item: GroupedCartItem['item']) => {
        const sizePrice = item.size?.extraPrice ?? 0;
        const extrasPrice = item.extras?.reduce((s, e) => s + e.extraPrice, 0) ?? 0;
        return item.basePrice + sizePrice + extrasPrice;
    }, []);

    if (groupedItems.length === 0) {
        return <p className="text-gray-400">Your cart is empty.</p>;
    }

    return (
        <ul className="space-y-6">
            {groupedItems.map((group) => (
                <li
                    key={group.key}
                    className="bg-[#2c1a0d] border border-amber-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                >
                    {/* Item Details */}
                    <div className="flex gap-4">
                        <div className="w-24 h-24 relative shrink-0">
                            <Image
                                src={group.item.imageUrl || "/hero-pizza.png"}
                                alt={group.item.name}
                                fill
                                className="object-cover rounded"
                                sizes="96px"
                            />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-amber-50">
                                {group.item.name}
                                {group.quantity > 1 && <span className="text-amber-300 ml-2">x{group.quantity}</span>}
                            </h3>

                            {/* Size Information */}
                            {group.item.size?.name && (
                                <p className="text-sm text-amber-200">
                                    <strong>Size:</strong> {group.item.size.name}
                                </p>
                            )}

                            {/* Extra Ingredients */}
                            {(group.item.extras?.length ?? 0) > 0 && (
                                <p className="text-sm text-amber-200">
                                    <strong>Toppings:</strong>{" "}
                                    {group.item.extras?.map((e) => e.name).join(", ")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col justify-between items-end">
                        <p className="text-sm text-amber-300 font-semibold">
                            ₹{getItemTotal(group.item) * group.quantity}
                        </p>
                        <button
                            onClick={() => onRemove(group.indices[0])}
                            className="text-red-400 hover:text-red-600 cursor-pointer transition-colors p-1"
                            title={group.quantity > 1 ? "Remove one item" : "Remove item"}
                            aria-label={`Remove ${group.item.name} from cart`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
