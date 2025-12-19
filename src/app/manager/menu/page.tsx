"use client";

import { useState, useEffect } from 'react';
import { getMenuData } from '@/lib/menu-data';
import { getMenuOverrides, updateMenuItemOverride, MenuOverride, getInventory } from '@/lib/supabase';
import { Category, MenuItem } from '@/lib/types';
import { Search, Save, AlertCircle } from 'lucide-react';

export default function MenuManagerPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [overrides, setOverrides] = useState<Record<string, MenuOverride>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data Load
    useEffect(() => {
        async function loadData() {
            // In a real app, this would be an API call. 
            // Since getMenuData is server-side node logic (fs), we can't call it directly in client component easily 
            // without a Server Action or API Route. 
            // For this persistent mock, we'll fetch from a new API route or pass it as props if this was a server component.
            // But since we are strictly client-side for state here, let's fetch from the API we are about to create, 
            // OR for now, since we haven't made an API, let's assume we fetch from a Client-compatible source 
            // or just move getMenuData logic to an API route.

            // ACTUALLY: getMenuData uses 'fs' so it MUST run on server. 
            // We need a Server Action or API Route. 
            // Let's quickly create a simplistic client-side compatible loader or fetch from an API.

            // To save time and keep it simple: We will fetch the CSV via fetch('/menu.csv') and parse it client-side
            // mirroring the server-logic, OR better: create a simple API route.

            // Let's assume we'll create the API route /api/menu in the next step.
            const res = await fetch('/api/menu');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }

            setOverrides(getMenuOverrides());
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleToggleAvailability = (item: MenuItem) => {
        const currentOverride = overrides[item.id] || {};
        // If override has 'available' set, usage that, else use item.available (default true)
        const currentStatus = currentOverride.available !== undefined ? currentOverride.available : item.available;

        const newStatus = !currentStatus;
        updateMenuItemOverride(item.id, { available: newStatus });
        setOverrides(prev => ({ ...prev, [item.id]: { ...prev[item.id], available: newStatus } }));
    };

    const handlePriceChange = (item: MenuItem, newPrice: string) => {
        const price = parseFloat(newPrice);
        if (isNaN(price)) return;

        updateMenuItemOverride(item.id, { price });
        setOverrides(prev => ({ ...prev, [item.id]: { ...prev[item.id], price } }));
    };

    if (isLoading) return <div className="p-8">Loading menu...</div>;

    const allItems = categories.flatMap(c => c.items);
    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Advanced Menu Management</h2>
                    <p className="text-slate-500">Quickly update stock status (86) and prices.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => {
                    const override = overrides[item.id];
                    const isAvailable = override?.available !== undefined ? override.available : item.available;
                    const price = override?.price !== undefined ? override.price : item.price;

                    // Calculate Recipe Cost
                    let recipeCost = 0;
                    if (override?.recipe) {
                        const inventory = getInventory();
                        override.recipe.forEach(ing => {
                            const invItem = inventory.find(i => i.id === ing.inventoryItemId);
                            if (invItem && invItem.costPerUnit) {
                                recipeCost += (invItem.costPerUnit * ing.quantity);
                            }
                        });
                    }

                    const margin = price - recipeCost;
                    const marginPercent = price > 0 ? ((margin / price) * 100).toFixed(0) : 0;

                    // Margin Color
                    let marginColor = "text-slate-500";
                    if (recipeCost > 0) {
                        if (Number(marginPercent) >= 70) marginColor = "text-green-600";
                        else if (Number(marginPercent) >= 30) marginColor = "text-yellow-600";
                        else marginColor = "text-red-600";
                    }

                    return (
                        <div
                            key={item.id}
                            className={`p-4 rounded-xl border transition-all ${isAvailable ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.category}</span>
                                    <h3 className={`font-bold text-lg leading-tight ${isAvailable ? 'text-slate-900' : 'text-red-700 decoration-red-900/30'}`}>
                                        {item.name}
                                    </h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isAvailable}
                                        onChange={() => handleToggleAvailability(item)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <label className="text-sm font-medium text-slate-500">Price $</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`w-24 px-2 py-1 border rounded text-right font-mono font-medium focus:ring-2 focus:ring-primary/50 outline-none ${isAvailable ? 'bg-slate-50' : 'bg-red-100/50'}`}
                                    value={price}
                                    onChange={(e) => handlePriceChange(item, e.target.value)}
                                />
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                                <span className="text-slate-500">Cost: <span className="font-mono text-slate-700">${recipeCost.toFixed(2)}</span></span>
                                {recipeCost > 0 && <span className={`font-bold ${marginColor}`}>{marginPercent}% Margin</span>}
                            </div>

                            {!isAvailable && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-medium">
                                    <AlertCircle className="w-3 h-3" />
                                    Out of Stock (86'd)
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
