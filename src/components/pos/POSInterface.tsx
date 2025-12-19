"use client";

import { useState, useEffect } from 'react';
import { Category, Area, Table } from '@/lib/types';
import CategoryTabs from './CategoryTabs';
import MenuGrid from './MenuGrid';
import CartSidebar from './CartSidebar';
import { saveOrder, getLayout, syncOrders, getOfflineQueue } from '@/lib/supabase';
import { syncTransactionToEposNow } from '@/lib/epos-now';
import { useCart } from '@/context/CartContext';
import Receipt from '@/components/pos/Receipt';
import { Order } from '@/lib/types';
import TableGrid from '@/components/floor-plan/TableGrid';
import { Grid, Wifi, WifiOff, RefreshCw, ChefHat, Monitor } from 'lucide-react';

interface POSInterfaceProps {
    categories: Category[];
}

export default function POSInterface({ categories }: POSInterfaceProps) {
    const { cartItems: cart, removeFromCart, updateQuantity, clearCart, total, subtotal, tax } = useCart();
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.name || '');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    // Table Management State
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [layout, setLayout] = useState<Area[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Offline State
    const [isOnline, setIsOnline] = useState(true);
    const [offlineQueueSize, setOfflineQueueSize] = useState(0);

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
        setLayout(getLayout());
        setOfflineQueueSize(getOfflineQueue().length);
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Poll for queue size updates (simple way)
        const interval = setInterval(() => {
            setOfflineQueueSize(getOfflineQueue().length);
        }, 2000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const handleSync = async () => {
        const syncedCount = await syncOrders();
        setOfflineQueueSize(0);
        alert(`Synced ${syncedCount} orders to server.`);
    };

    const allItems = categories.flatMap(c => c.items);
    const activeItems = searchQuery
        ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        : categories.find(c => c.name === activeCategory)?.items || [];

    const handleTableSelect = (table: Table) => {
        if (table.status !== 'available' && table.status !== 'occupied') {
            // Optional: Allow selecting occupied tables to add to order? For now, just allow selecting.
        }
        setSelectedTable(table);
        setIsTableModalOpen(false);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Ensure table is selected if required (Optional: could enforce it)
        // if (!selectedTable) { alert("Please select a table"); return; }

        // Save order to Mock Backend
        const order = await saveOrder(cart, total, 'cash', selectedTable?.id); // Defaulting to cash for now

        if (order) {
            setLastOrder(order);

            // Sync to Epos Now (Fire and Forget or Await based on preference)
            console.log("Syncing to Epos Now...");
            if (isOnline) {
                // Only sync to external API if online
                const eposResult = await syncTransactionToEposNow({
                    date: order.created_at,
                    totalAmount: order.total,
                    paymentMethod: order.payment_method,
                    items: cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        vatRate: 0.10 // Hardcoded for now matches tax calc
                    }))
                });
                console.log("Epos Now Result:", eposResult);
            }

            // Wait for state update then print
            setTimeout(() => {
                window.print();
                clearCart();
                setSelectedTable(null); // Reset table after order
            }, 100);
        } else {
            alert('Failed to save order');
        }
    };

    return (
        <div className="flex h-full w-full bg-background">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header / Top Bar */}
                <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-6 justify-between shrink-0 sticky top-0 z-20 gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-orange-500/20">
                            FC
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground leading-tight">Foodie&apos;s POS</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Terminal 01</p>
                                <button
                                    onClick={() => window.open('/customer-display', 'CustomerDisplay', 'width=1024,height=768')}
                                    className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                                >
                                    Open Display
                                </button>
                                <button
                                    onClick={() => window.open('/kitchen', 'KitchenDisplay', 'width=1024,height=768')}
                                    className="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <ChefHat className="w-3 h-3" /> Kitchen
                                </button>
                                {isOnline ? (
                                    <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                        <Wifi className="w-3 h-3" /> Online
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 font-bold">
                                        <WifiOff className="w-3 h-3" /> Offline
                                    </span>
                                )}
                                {offlineQueueSize > 0 && (
                                    <button
                                        onClick={handleSync}
                                        className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse hover:bg-amber-100"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Sync ({offlineQueueSize})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md relative group">
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className="w-full bg-muted/50 border border-border rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setLayout(getLayout()); setIsTableModalOpen(true); }}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm
                                ${selectedTable
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}
                            `}
                        >
                            <Grid className="w-4 h-4" />
                            {selectedTable ? `Table ${selectedTable.label}` : 'Dine In'}
                        </button>

                        <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 shrink-0">
                            {currentDate}
                        </div>
                    </div>
                </header>

                {/* Categories (Hide when searching) */}
                {!searchQuery && (
                    <div className="p-4 pb-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <CategoryTabs
                            categories={categories.map(c => c.name)}
                            activeCategory={activeCategory}
                            onSelect={setActiveCategory}
                        />
                    </div>
                )}

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted">
                    <MenuGrid items={activeItems} />
                </div>
            </div>

            {/* Right Sidebar - Cart */}
            <div className="w-96 shrink-0 h-full">
                <CartSidebar onCheckout={handleCheckout} />
            </div>

            <Receipt order={lastOrder} />

            {/* Table Selection Modal */}
            {isTableModalOpen && (
                <TableGrid
                    layout={layout}
                    onSelectTable={handleTableSelect}
                    onClose={() => setIsTableModalOpen(false)}
                />
            )}
        </div>
    );
}
