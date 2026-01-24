import { useMemo } from 'react';
import { CartProduct } from '@/components/AppContext';
import { GroupedCartItem, CartTotals } from '@/types/cart';

export function useCartCalculations(cartProducts: CartProduct[]) {
    const totals: CartTotals = useMemo(() => {
        const subtotal = cartProducts.reduce((sum, item) => {
            const sizePrice = item.size?.extraPrice ?? 0;
            const extrasPrice = item.extras?.reduce((s, e) => s + e.extraPrice, 0) ?? 0;
            return sum + item.basePrice + sizePrice + extrasPrice;
        }, 0);

        const tax = Math.round(subtotal * 0.05);
        const deliveryFee = subtotal >= 400 ? 0 : 50;
        const total = subtotal + tax + deliveryFee;

        return { subtotal, tax, deliveryFee, total };
    }, [cartProducts]);

    const groupedItems: GroupedCartItem[] = useMemo(() => {
        return cartProducts.reduce((acc, item, index) => {
            const extrasString = (item.extras ?? []).map(e => e.name).sort().join('|');
            const key = `${item._id}|${item.name}|${item.size?.name || ''}|${extrasString}`;

            const existing = acc.find(g => g.key === key);
            if (existing) {
                existing.quantity += 1;
                existing.indices.push(index);
            } else {
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
