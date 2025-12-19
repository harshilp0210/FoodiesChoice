"use client";

import { useState, useEffect } from 'react';
import { getInventory, updateInventoryItem, deleteInventoryItem } from '@/lib/supabase';
import { InventoryItem } from '@/lib/types';
import { Plus, Trash2, Edit2, Package, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = getInventory();
        setItems(data);
        setIsLoading(false);
    };

    const handleOpenForm = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({});
        }
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            const updated = deleteInventoryItem(id);
            setItems(updated);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: InventoryItem = {
            id: editingItem ? editingItem.id : uuidv4(),
            name: formData.name || 'New Item',
            quantity: Number(formData.quantity) || 0,
            unit: formData.unit || 'units',
            threshold: Number(formData.threshold) || 0,
            costPerUnit: Number(formData.costPerUnit) || 0,
            category: formData.category || 'General',
        };
        const updated = updateInventoryItem(newItem);
        setItems(updated);
        setIsFormOpen(false);
    };

    if (isLoading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h2>
                    <p className="text-slate-500">Track stock levels and ingredients.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Item Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Quantity</th>
                            <th className="px-6 py-4">Cost/Unit</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    No items found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const isLow = item.quantity <= item.threshold;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{item.category}</td>
                                        <td className="px-6 py-4 font-mono text-slate-700">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-700">
                                            ${(item.costPerUnit || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isLow ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenForm(item)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-blue-600 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">{editingItem ? 'Edit Item' : 'Add Inventory'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-slate-900 placeholder:text-slate-400"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-slate-900 placeholder:text-slate-400"
                                        value={formData.quantity || ''}
                                        onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="kg, pcs..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-slate-900 placeholder:text-slate-400"
                                        value={formData.unit || ''}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-slate-900"
                                        value={formData.category || 'General'}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Produce">Produce</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Dry Goods">Dry Goods</option>
                                        <option value="Pantry">Pantry</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alert Threshold</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-slate-900 placeholder:text-slate-400"
                                        value={formData.threshold || ''}
                                        onChange={e => setFormData({ ...formData, threshold: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cost Per Unit ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-slate-900 placeholder:text-slate-400"
                                    value={formData.costPerUnit || ''}
                                    onChange={e => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium shadow-sm transition-transform active:scale-95"
                                >
                                    {editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
