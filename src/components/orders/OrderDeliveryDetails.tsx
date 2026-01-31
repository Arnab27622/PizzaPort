/**
 * Shows where the order should be delivered.
 * Includes Customer Name, Email, and the full Address.
 */

import React from "react";

interface OrderDeliveryDetailsProps {
    userName: string;
    userEmail: string;
    address: string;
}

const OrderDeliveryDetails: React.FC<OrderDeliveryDetailsProps> = ({
    userName,
    userEmail,
    address
}) => {
    return (
        <div className="bg-black/20 p-4 md:p-6 rounded-xl border border-amber-900/60">
            <h2 className="font-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2 text-amber-500 uppercase tracking-widest justify-center sm:justify-start">
                Delivery Details
            </h2>
            <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col text-center sm:text-left">
                    <span className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter">Customer Name</span>
                    <span className="text-sm md:text-base text-amber-50 font-medium">{userName}</span>
                </div>
                <div className="flex flex-col text-center sm:text-left">
                    <span className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter">Email Address</span>
                    <span className="text-sm md:text-base text-amber-50 font-medium break-all">{userEmail}</span>
                </div>
                <div className="flex flex-col text-center sm:text-left">
                    <span className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter">
                        Shipping Address
                    </span>
                    <span className="text-sm md:text-base text-amber-200/90 whitespace-normal">{address}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderDeliveryDetails;
