"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem } from '@/lib/types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    subtotal: number;
    tax: number;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (item: MenuItem) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1, cartId: self.crypto.randomUUID() }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => setCartItems([]);

    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    // Assuming 10% tax for now, configurable later
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    // Broadcast cart text updates to other tabs (Customer Display)
    useEffect(() => {
        const channel = new BroadcastChannel('customer-display');
        channel.postMessage({
            type: 'CART_UPDATE',
            payload: {
                cartItems,
                subtotal,
                tax,
                total
            }
        });

        // Cleanup
        return () => {
            channel.close();
        };
    }, [cartItems, subtotal, tax, total]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                subtotal,
                tax,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
