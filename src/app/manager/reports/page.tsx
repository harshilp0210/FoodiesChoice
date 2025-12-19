"use client";

import { BarChart3, TrendingUp, Calendar, ArrowUpRight, RefreshCw, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ReportsPage() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const handleSync = () => {
        setIsSyncing(true);
        // Simulate API delay
        setTimeout(() => {
            setIsSyncing(false);
            setLastSync(new Date().toLocaleTimeString());
            alert("Daily Sales synced to QuickBooks successfully!");
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Performance Reports</h2>
                <div className="flex items-center gap-3">
                    {lastSync && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Synced at {lastSync}
                        </span>
                    )}
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all font-medium text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Daily Sales'}
                    </button>
                </div>
            </div>

            {/* Simulated Chart Container */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-slate-500" />
                        Weekly Sales Revenue
                    </h3>
                    <select className="border rounded-lg px-2 py-1 text-sm bg-slate-50">
                        <option>This Week</option>
                        <option>Last Week</option>
                        <option>This Month</option>
                    </select>
                </div>

                {/* Visual Fake Chart using CSS Grid/Flex */}
                <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4 border-b border-l border-slate-200">
                    {[
                        { day: 'Mon', val: 40, label: '$400' },
                        { day: 'Tue', val: 55, label: '$550' },
                        { day: 'Wed', val: 35, label: '$350' },
                        { day: 'Thu', val: 70, label: '$700' },
                        { day: 'Fri', val: 85, label: '$850' },
                        { day: 'Sat', val: 95, label: '$950' },
                        { day: 'Sun', val: 60, label: '$600' },
                    ].map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-600 mb-1">{d.label}</div>
                            <div
                                className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-lg relative group-hover:shadow-lg"
                                style={{ height: `${d.val}%` }}
                            />
                            <span className="text-xs font-medium text-slate-500">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Top Selling Items</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Margherita Pizza', sold: 145, revenue: '$2,175' },
                            { name: 'Spicy Pepperoni', sold: 112, revenue: '$1,890' },
                            { name: 'Garlic Bread', sold: 89, revenue: '$445' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.sold} sold</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-700">{item.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Category Breakdown</h3>
                    <div className="space-y-4">
                        {[
                            { cat: 'Pizza', pct: '65%', color: 'bg-primary' },
                            { cat: 'Beverages', pct: '20%', color: 'bg-blue-500' },
                            { cat: 'Sides', pct: '15%', color: 'bg-green-500' },
                        ].map((c, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">{c.cat}</span>
                                    <span className="text-slate-500">{c.pct}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${c.color}`} style={{ width: c.pct }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
