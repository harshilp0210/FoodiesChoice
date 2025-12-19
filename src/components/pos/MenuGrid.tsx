"use client";

import { MenuItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { getMenuOverrides, MenuOverride } from '@/lib/supabase';
// import Image from 'next/image';

interface MenuGridProps {
    items: MenuItem[];
}

export default function MenuGrid({ items }: MenuGridProps) {
    const { addToCart } = useCart();
    const [overrides, setOverrides] = useState<Record<string, MenuOverride>>({});

    useEffect(() => {
        // Initial load
        setOverrides(getMenuOverrides());

        // Listen for updates from Manager tabs
        const handleUpdate = () => setOverrides(getMenuOverrides());
        window.addEventListener('menu_updated', handleUpdate);
        window.addEventListener('storage', (e) => {
            if (e.key === 'foodies_pos_menu_overrides') handleUpdate();
        });

        return () => {
            window.removeEventListener('menu_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {items.map((item) => {
                const override = overrides[item.id];
                const isAvailable = override?.available !== undefined ? override.available : (item.available ?? true);
                const price = override?.price !== undefined ? override.price : item.price;
                const recipe = override?.recipe || item.recipe;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "bg-card border rounded-xl p-3 flex flex-col gap-3 transition-all duration-200 shadow-sm h-full group",
                            isAvailable
                                ? "hover:border-primary/50 cursor-pointer hover:shadow-md active:scale-95"
                                : "opacity-60 cursor-not-allowed grayscale bg-slate-100"
                        )}
                        onClick={() => isAvailable && addToCart({ ...item, price, recipe })}
                    >
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                            {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                            ) : (
                                <div className="text-muted-foreground/40 text-xs font-medium">
                                    {item.category}
                                </div>
                            )}
                            {!isAvailable && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm transform -rotate-12">
                                        SOLD OUT
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{item.name}</h3>
                            {item.description && (
                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="font-bold text-base text-primary">£{price.toFixed(2)}</span>
                            {isAvailable && (
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Plus className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
