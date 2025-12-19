"use client";

import { useState, useEffect } from 'react';
import { getLayout, saveLayout } from '@/lib/supabase';
import { Area } from '@/lib/types';
import { FloorPlanEditor } from '@/components/floor-plan/FloorPlanEditor';

export default function FloorPlanPage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setAreas(getLayout());
        setIsLoading(false);
    }, []);

    const handleSave = (newAreas: Area[]) => {
        saveLayout(newAreas);
        alert('Layout saved successfully!');
    };

    if (isLoading) return <div className="p-8">Loading layout...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Table & Floor Management</h2>
                <p className="text-slate-500">Design your restaurant layout and manage tables.</p>
            </div>

            <FloorPlanEditor initialAreas={areas} onSave={handleSave} />
        </div>
    );
}
