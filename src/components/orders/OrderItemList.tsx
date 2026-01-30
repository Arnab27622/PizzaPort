/**
 * Displays the list of food items in the order.
 * If the user ordered the same item multiple times (same size/toppings), it groups them together (e.g., "x2 Pepperoni Pizza").
 */

import React, { useMemo } from "react";
import Image from "next/image";
import { OrderItem } from "@/types/order";
import { formatCurrency } from "@/lib/formatters";

interface OrderItemListProps {
    items: OrderItem[]; // List of items in the cart
}

const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
    const groupedItems = useMemo(() => {
        return items.reduce((acc, item) => {
            const extrasString = (item.extras ?? []).map(e => e.name).sort().join('|');
            const key = `${item.name}|${item.size?.name || ''}|${extrasString}`;

            const sizePrice = item.size?.extraPrice || 0;
            const extrasPrice = item.extras?.reduce((sum, extra) => sum + extra.extraPrice, 0) || 0;
            const itemTotal = item.basePrice + sizePrice + extrasPrice;

            if (!acc[key]) {
                acc[key] = {
                    item,
                    quantity: 0,
                    total: itemTotal
                };
            }
            acc[key].quantity += item.quantity || 1;

            return acc;
        }, {} as Record<string, { item: OrderItem; quantity: number; total: number }>);
    }, [items]);

    const groupedItemsArray = Object.values(groupedItems);

    return (
        <div>
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-primary">🍕</span> Order Items
            </h2>
            <div className="grid gap-3 md:gap-4">
                {groupedItemsArray.map((group, idx) => (
                    <div
                        key={`${group.item.name}-${idx}`}
                        className="bg-[#2c1a0d]/30 border border-amber-900/20 p-3 md:p-4 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all hover:border-primary/30"
                    >
                        {group.item.imageUrl && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-amber-900/30 shadow-md">
                                <Image
                                    src={group.item.imageUrl}
                                    alt={group.item.name}
                                    className="w-full h-full object-cover"
                                    width={80}
                                    height={80}
                                />
                            </div>
                        )}

                        <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                                <p className="text-base md:text-lg font-bold text-amber-50 whitespace-normal">
                                    {group.item.name}
                                    {group.quantity > 1 && (
                                        <span className="bg-primary/20 text-primary text-[10px] md:text-xs px-2 py-0.5 rounded ml-2 align-middle">
                                            x{group.quantity}
                                        </span>
                                    )}
                                </p>
                                <p className="font-bold text-base md:text-lg text-amber-200">
                                    {formatCurrency(group.total * group.quantity)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                {group.item.size && (
                                    <p className="text-xs md:text-sm text-amber-400/80 flex items-center gap-1.5 justify-center sm:justify-start">
                                        <span className="w-1 h-1 bg-amber-600 rounded-full" />
                                        Size: {group.item.size.name}
                                    </p>
                                )}
                                {(group.item.extras?.length ?? 0) > 0 && (
                                    <div className="text-xs md:text-sm text-amber-400/80 flex items-start gap-1.5 justify-center sm:justify-start">
                                        <span className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 shrink-0" />
                                        <span className="whitespace-normal">Extras: {group.item.extras!.map(e => e.name).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderItemList;
