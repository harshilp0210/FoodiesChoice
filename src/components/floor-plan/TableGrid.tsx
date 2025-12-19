"use client";

import { Area, Table } from '@/lib/types';

interface TableGridProps {
    layout: Area[];
    onSelectTable: (table: Table) => void;
    onClose: () => void;
}

export default function TableGrid({ layout, onSelectTable, onClose }: TableGridProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Select a Table</h2>
                        <p className="text-slate-500">Choose a table to start the order.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-slate-100 p-8 relative">
                    {/* Render different areas if we had multiple, for now just rendering all flat or first area */}
                    {layout.map(area => (
                        <div key={area.id} className="mb-12 relative h-[600px] border-2 border-dashed border-slate-300 rounded-xl bg-white/50">
                            <h3 className="absolute -top-4 left-6 bg-slate-100 px-3 py-1 font-bold text-slate-500 uppercase text-xs tracking-wider rounded-full border">{area.name}</h3>

                            {area.tables.map(table => (
                                <button
                                    key={table.id}
                                    onClick={() => onSelectTable(table)}
                                    // Use absolute positioning relative to the area container
                                    style={{
                                        position: 'absolute',
                                        left: `${table.x}px`,
                                        top: `${table.y}px`,
                                        width: `${table.width}px`,
                                        height: `${table.height}px`,
                                    }}
                                    className={`
                                        flex flex-col items-center justify-center rounded-lg border-2 shadow-sm transition-all duration-200 active:scale-95
                                        ${table.status === 'occupied'
                                            ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
                                            : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 hover:shadow-md'
                                        }
                                        ${table.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                                    `}
                                >
                                    <span className="font-bold text-lg">{table.label}</span>
                                    <span className="text-xs opacity-75">{table.seats} Seats</span>
                                    <span className="text-[10px] uppercase font-bold mt-1 tracking-wider">{table.status}</span>
                                </button>
                            ))}
                        </div>
                    ))}

                    {layout.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <p>No floor plan found.</p>
                            <p className="text-sm">Create one in the Manager Dashboard.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
