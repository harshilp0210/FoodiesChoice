"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Table } from '@/lib/types';

interface DraggableTableProps {
    table: Table;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

export function DraggableTable({ table, isSelected, onSelect }: DraggableTableProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: table.id,
        data: table,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: `${table.x}px`,
        top: `${table.y}px`,
        width: `${table.width}px`,
        height: `${table.height}px`,
        position: 'absolute' as 'absolute',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(table.id);
            }}
            className={`
                flex flex-col items-center justify-center 
                border-2 shadow-sm cursor-move touch-none transition-colors
                ${table.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
                ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-300 bg-white hover:border-slate-400'}
                ${table.status === 'occupied' ? 'bg-red-50 border-red-200' : ''}
            `}
        >
            <span className={`font-bold ${table.status === 'occupied' ? 'text-red-700' : 'text-slate-700'}`}>
                {table.label}
            </span>
            <span className="text-xs text-slate-400">
                {table.seats} Seats
            </span>
        </div>
    );
}
