"use client";

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Area, Table } from '@/lib/types';
import { DraggableTable } from './DraggableTable';
import { Plus, Save, Square, Circle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FloorPlanEditorProps {
    initialAreas: Area[];
    onSave: (areas: Area[]) => void;
}

export function FloorPlanEditor({ initialAreas, onSave }: FloorPlanEditorProps) {
    const [areas, setAreas] = useState<Area[]>(initialAreas);
    const [activeAreaId, setActiveAreaId] = useState<string>(initialAreas[0]?.id || '');
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    // Sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // minimum distance to trigger drag (prevents accidental clicks)
            },
        })
    );

    const activeArea = areas.find(a => a.id === activeAreaId);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        if (!activeArea) return;

        setAreas(prev => prev.map(area => {
            if (area.id !== activeAreaId) return area;
            return {
                ...area,
                tables: area.tables.map(table => {
                    if (table.id === active.id) {
                        return {
                            ...table,
                            x: Math.max(0, table.x + delta.x),
                            y: Math.max(0, table.y + delta.y),
                        };
                    }
                    return table;
                })
            };
        }));
    };

    const addTable = (shape: 'rectangle' | 'circle') => {
        if (!activeArea) return;

        const newTable: Table = {
            id: uuidv4(),
            label: `${activeArea.tables.length + 1}`,
            x: 50,
            y: 50,
            width: 80,
            height: 80,
            shape,
            seats: 4,
            status: 'available',
        };

        setAreas(prev => prev.map(a => {
            if (a.id === activeAreaId) {
                return { ...a, tables: [...a.tables, newTable] };
            }
            return a;
        }));
    };

    const updateSelectedTable = (updates: Partial<Table>) => {
        if (!activeArea || !selectedTableId) return;

        setAreas(prev => prev.map(a => {
            if (a.id !== activeAreaId) return a;
            return {
                ...a,
                tables: a.tables.map(t => t.id === selectedTableId ? { ...t, ...updates } : t)
            };
        }));
    };

    const deleteSelectedTable = () => {
        if (!activeArea || !selectedTableId) return;
        if (!confirm('Delete this table?')) return;

        setAreas(prev => prev.map(a => {
            if (a.id !== activeAreaId) return a;
            return {
                ...a,
                tables: a.tables.filter(t => t.id !== selectedTableId)
            };
        }));
        setSelectedTableId(null);
    };

    // Find the selected table object for the sidebar
    const selectedTable = activeArea?.tables.find(t => t.id === selectedTableId);

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6">
            {/* Canvas Area */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    {activeArea?.tables.map(table => (
                        <DraggableTable
                            key={table.id}
                            table={table}
                            isSelected={selectedTableId === table.id}
                            onSelect={setSelectedTableId}
                        />
                    ))}
                </DndContext>

                {(!activeArea || activeArea.tables.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                        Use the tools to add tables to the floor plan
                    </div>
                )}
            </div>

            {/* Sidebar Controls */}
            <div className="w-80 space-y-6">
                {/* Area Selector */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Dining Area</label>
                    <select
                        className="w-full border rounded-lg p-2 mb-4 text-slate-900 bg-white"
                        value={activeAreaId}
                        onChange={e => { setActiveAreaId(e.target.value); setSelectedTableId(null); }}
                    >
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => addTable('rectangle')}
                            className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                        >
                            <Square className="w-4 h-4" />
                            Add Square
                        </button>
                        <button
                            onClick={() => addTable('circle')}
                            className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                        >
                            <Circle className="w-4 h-4" />
                            Add Circle
                        </button>
                    </div>
                </div>

                {/* Properties Panel */}
                {selectedTable ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-bold text-slate-900">Table Properties</h3>
                            <button onClick={deleteSelectedTable} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
                            <input
                                type="text"
                                value={selectedTable.label}
                                onChange={e => updateSelectedTable({ label: e.target.value })}
                                className="w-full border rounded p-2 text-slate-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Seats</label>
                                <input
                                    type="number"
                                    value={selectedTable.seats}
                                    onChange={e => updateSelectedTable({ seats: Number(e.target.value) })}
                                    className="w-full border rounded p-2 text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                                <select
                                    value={selectedTable.status}
                                    onChange={e => updateSelectedTable({ status: e.target.value as any })}
                                    className="w-full border rounded p-2 text-slate-900"
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="billed">Billed</option>
                                    <option value="cleaning">Cleaning</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Width (px)</label>
                                <input
                                    type="number"
                                    value={selectedTable.width}
                                    onChange={e => updateSelectedTable({ width: Number(e.target.value) })}
                                    className="w-full border rounded p-2 text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Height (px)</label>
                                <input
                                    type="number"
                                    value={selectedTable.height}
                                    onChange={e => updateSelectedTable({ height: Number(e.target.value) })}
                                    className="w-full border rounded p-2 text-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-6 rounded-xl border border-dashed text-center text-slate-400 text-sm">
                        Select a table to edit its properties
                    </div>
                )}

                <button
                    onClick={() => onSave(areas)}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save Layout
                </button>
            </div>
        </div>
    );
}
