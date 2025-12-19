"use client";

import { ShoppingBag, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function OrderLayout({ children }: { children: React.ReactNode }) {
    const { total, cartItems } = useCart();
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
            {/* Simple Public Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/order" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">Foodie's POS</span>
                    </Link>

                    <Link href="/order/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ShoppingBag className="w-6 h-6 text-slate-700" />
                        {itemCount > 0 && (
                            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {children}
            </main>

            {/* Mobile Bottom Floating Cart */}
            {itemCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:hidden z-50 px-4 pb-6">
                    <Link href="/order/cart" className="w-full bg-primary text-white py-3 rounded-xl flex items-center justify-between px-6 shadow-lg active:scale-95 transition-transform">
                        <span className="font-bold border-r border-white/20 pr-4">{itemCount} items</span>
                        <span className="font-bold flex-1 text-center">View Cart</span>
                        <span className="font-bold">${total.toFixed(2)}</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
