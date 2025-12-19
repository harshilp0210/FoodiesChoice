"use client";

import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import LowStockAlert from '@/components/dashboard/LowStockAlert';

const stats = [
    { label: 'Total Revenue', value: '$2,456.00', icon: DollarSign, trend: '+12.5%', color: 'bg-green-500/10 text-green-600' },
    { label: 'Orders Today', value: '45', icon: ShoppingBag, trend: '+5%', color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Avg. Order Value', value: '$54.50', icon: TrendingUp, trend: '+2.1%', color: 'bg-purple-500/10 text-purple-600' },
    { label: 'Low Stock Alerts', value: '3', icon: AlertTriangle, trend: 'Action Needed', color: 'bg-orange-500/10 text-orange-600' },
];

export default function ManagerDashboard() {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend.includes('Action') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Sales</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-2 -mx-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                        #{1000 + i}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700">Table {i + 2}</p>
                                        <p className="text-xs text-slate-400">Guest Order • {new Date().toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-700">$42.50</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Alerts</h3>
                    <LowStockAlert />
                </div>
            </div>
        </div>
    );
}
