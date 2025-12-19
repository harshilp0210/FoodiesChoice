"use client";

import { useEffect, useState } from 'react';
import { getInventory } from '@/lib/supabase';
import { InventoryItem } from '@/lib/types';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LowStockAlert() {
    const [lowItems, setLowItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        const checkStock = () => {
            const inventory = getInventory();
            const low = inventory.filter(item => item.quantity <= item.threshold);
            setLowItems(low);
        };
        checkStock();

        // Listen for inventory updates
        const handleUpdate = () => checkStock();
        window.addEventListener('storage', handleUpdate);
        window.addEventListener('inventory_updated', handleUpdate);

        return () => {
            window.removeEventListener('storage', handleUpdate);
            window.removeEventListener('inventory_updated', handleUpdate);
        };
    }, []);

    if (lowItems.length === 0) return null;

    return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                    <AlertCircle className="w-5 h-5" />
                    <h3>Low Stock Alert</h3>
                    <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">{lowItems.length} Items</span>
                </div>
                <Link href="/manager/inventory" className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                    Manage <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-2">
                {lowItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-red-100 shadow-sm">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-red-600 font-bold">{item.quantity} {item.unit}</span>
                            <span className="text-slate-400 text-xs text-right w-16">Min: {item.threshold}</span>
                        </div>
                    </div>
                ))}
                {lowItems.length > 3 && (
                    <p className="text-center text-xs text-red-500 pt-1">+ {lowItems.length - 3} more items low</p>
                )}
            </div>
        </div>
    );
}
