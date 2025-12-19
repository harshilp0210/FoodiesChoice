"use client";

import { useState, useEffect } from 'react';
import { getVendors, getInventory, savePurchaseOrder, getPurchaseOrders } from '@/lib/supabase';
import { Vendor, InventoryItem, PurchaseOrder } from '@/lib/types';
import { Plus, Trash2, ClipboardList, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function PurchaseOrdersPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [selectedVendor, setSelectedVendor] = useState('');
    const [cart, setCart] = useState<{ itemId: string; quantity: number; cost: number }[]>([]);

    useEffect(() => {
        setVendors(getVendors());
        setInventory(getInventory());
        setOrders(getPurchaseOrders());
    }, []);

    const addToPO = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.itemId === itemId);
            if (existing) return prev; // Already in PO
            return [...prev, { itemId, quantity: 1, cost: 0 }];
        });
    };

    const updateItem = (itemId: string, field: 'quantity' | 'cost', value: number) => {
        setCart(prev => prev.map(i => i.itemId === itemId ? { ...i, [field]: value } : i));
    };

    const removeFromPO = (itemId: string) => {
        setCart(prev => prev.filter(i => i.itemId !== itemId));
    };

    const calculateTotal = () => cart.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || cart.length === 0) return;

        const newPO: PurchaseOrder = {
            id: uuidv4(),
            vendorId: selectedVendor,
            items: cart.map(i => ({ inventoryItemId: i.itemId, quantity: i.quantity, cost: i.cost })),
            totalCost: calculateTotal(),
            status: 'Pending',
            created_at: new Date().toISOString()
        };

        const updated = savePurchaseOrder(newPO);
        setOrders(updated);
        setIsFormOpen(false);
        setCart([]);
        setSelectedVendor('');
        setIsFormOpen(false);
        setCart([]);
        setSelectedVendor('');
    };

    const handleExport = async (po: PurchaseOrder) => {
        if (confirm('Export this PO to xtraCHEF?')) {
            // Simulate API call
            const updated = savePurchaseOrder({ ...po, synced: true, status: 'Ordered' });
            setOrders(updated);
            alert('Purchase Order exported successfully!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Purchase Orders</h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Create PO
                </button>
            </div>

            {/* List of POs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4">PO ID</th>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Total Cost</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map(po => {
                            const vendorName = vendors.find(v => v.id === po.vendorId)?.name || 'Unknown Vendor';
                            return (
                                <tr key={po.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-xs">{po.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4 font-medium">{vendorName}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">{po.status}</span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(po.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-bold">${po.totalCost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {po.synced ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                                                <CheckCircle className="w-3 h-3" /> Synced
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleExport(po)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Export to Accounting
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No purchase orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create PO Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-900">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg">Create Purchase Order</h3>
                            <button onClick={() => setIsFormOpen(false)}>✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Vendor</label>
                                <select
                                    className="w-full border rounded-lg p-2 text-black"
                                    value={selectedVendor}
                                    onChange={e => setSelectedVendor(e.target.value)}
                                >
                                    <option value="">-- Choose Vendor --</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                                <h4 className="font-bold text-sm mb-3">Add Items to Order</h4>
                                <div className="flex gap-2 mb-4">
                                    <select
                                        className="flex-1 border rounded-lg p-2 text-sm text-black"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addToPO(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="">+ Add Inventory Item...</option>
                                        {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                    </select>
                                </div>

                                {cart.map(item => {
                                    const inv = inventory.find(i => i.id === item.itemId);
                                    if (!inv) return null;
                                    return (
                                        <div key={item.itemId} className="flex items-center gap-2 mb-2 bg-white p-2 rounded border">
                                            <span className="flex-1 font-medium text-sm">{inv.name}</span>
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-20 border rounded p-1 text-sm text-black placeholder:text-gray-500"
                                                value={item.quantity}
                                                onChange={e => updateItem(item.itemId, 'quantity', Number(e.target.value))}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Cost ($)"
                                                className="w-24 border rounded p-1 text-sm text-black placeholder:text-gray-500"
                                                value={item.cost}
                                                onChange={e => updateItem(item.itemId, 'cost', Number(e.target.value))}
                                            />
                                            <button onClick={() => removeFromPO(item.itemId)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
                            <div className="text-xl font-bold">Total: ${calculateTotal().toFixed(2)}</div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedVendor || cart.length === 0}
                                    className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                                >
                                    Submit Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
