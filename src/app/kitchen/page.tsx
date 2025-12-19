"use client";

import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import { subscribeToOrders, updateOrderStatus } from '@/lib/supabase';
import KitchenOrderCard from '@/components/kitchen/KitchenOrderCard';
import { ChefHat, ListChecks } from 'lucide-react';

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((allOrders) => {
            const active = allOrders.filter(o => o.status !== 'completed') // Show all active states
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setOrders(active);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
        await updateOrderStatus(orderId, status);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Kitchen Display System</h1>
                        <p className="text-xs text-muted-foreground">Active Orders: {orders.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> New</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Cooking</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> &gt; 10m</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> &gt; 20m</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full animate-pulse border border-border">
                        ● Live
                    </span>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                {orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                        <ListChecks className="w-24 h-24 stroke-1" />
                        <p className="text-xl">All caught up! No active orders.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {orders.map(order => (
                            <KitchenOrderCard
                                key={order.id}
                                order={order}
                                onStatusUpdate={handleStatusUpdate}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
