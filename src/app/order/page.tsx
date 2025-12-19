"use client";

import MenuGrid from '@/components/pos/MenuGrid';
import { useEffect, useState } from 'react';
import { Category, MenuItem } from '@/lib/types';

export default function OrderPage() {
    const [items, setItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        fetch('/api/menu')
            .then(res => res.json())
            .then((data: Category[]) => {
                const allItems = data.flatMap(c => c.items);
                setItems(allItems);
            });
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-600/80 mix-blend-multiply opacity-80" />
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Craving Something Delicious?</h1>
                    <p className="text-slate-100 text-lg mb-6">Order fresh, hot meals directly from your phone. Pickup in 15 mins.</p>
                    <button className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                        Browse Menu ↓
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Our Menu</h2>
                <MenuGrid items={items} />
            </div>
        </div>
    );
}
