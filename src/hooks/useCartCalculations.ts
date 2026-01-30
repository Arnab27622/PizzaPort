/**
 * This custom hook handles all the math for the shopping cart.
 * It calculates the subtotal, taxes, delivery fees, and groups similar items together.
 */

import { useMemo } from 'react';
import { CartProduct, GroupedCartItem, CartTotals } from '@/types/cart';

/**
 * useCartCalculations Hook
 * Takes the cart items, coupon discount, and coupon code to calculate totals.
 */
export function useCartCalculations(
    cartProducts: CartProduct[],
    couponDiscount: number = 0,
    appliedCouponCode?: string
) {
    /**
     * Calculate the "Totals" (money summary)
     */
    const totals: CartTotals = useMemo(() => {
        const subtotal = cartProducts.reduce((sum, item) => {
            // 1. Pick the best price (sale price vs original price)
            const itemPrice = (item.discountPrice && item.discountPrice < item.basePrice)
                ? item.discountPrice
                : item.basePrice;

            // 2. Add extra cost for the size (e.g., +₹50 for Large)
            const sizePrice = item.size?.extraPrice ?? 0;

            // 3. Add extra cost for toppings
            const extrasPrice = item.extras?.reduce((s, e) => s + e.extraPrice, 0) ?? 0;

            return sum + itemPrice + sizePrice + extrasPrice;
        }, 0);

        // 5% tax
        const tax = Math.round(subtotal * 0.05);

        // Free delivery if order is ₹400 or more, otherwise ₹50
        const deliveryFee = subtotal >= 400 ? 0 : 50;

        // Final total (ensuring it's not a negative number)
        const total = Math.max(0, subtotal + tax + deliveryFee - couponDiscount);

        return { subtotal, tax, deliveryFee, couponDiscount, total, appliedCouponCode };
    }, [cartProducts, couponDiscount, appliedCouponCode]);

    /**
     * Group items that are exactly the same.
     * If you add two "Medium Margherita Pizzas", it shows them as one row with "Quantity: 2".
     */
    const groupedItems: GroupedCartItem[] = useMemo(() => {
        return cartProducts.reduce((acc, item, index) => {
            // Create a unique key for this specific item configuration
            const extrasString = (item.extras ?? []).map(e => e.name).sort().join('|');
            const key = `${item._id}|${item.name}|${item.size?.name || ''}|${extrasString}`;

            const existing = acc.find(g => g.key === key);
            if (existing) {
                // If it already exists in our list, just increase the quantity
                existing.quantity += 1;
                existing.indices.push(index);
            } else {
                // Otherwise, add it as a new group
                acc.push({
                    key,
                    item,
                    quantity: 1,
                    indices: [index]
                });
            }

            return acc;
        }, [] as GroupedCartItem[]);
    }, [cartProducts]);

    return { totals, groupedItems };
}

