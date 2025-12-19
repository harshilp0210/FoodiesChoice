
export interface MenuItem {
    id: string;
    category: string;
    name: string;
    price: number;
    description: string;
    image?: string;
    available: boolean;
    recipe?: {
        inventoryItemId: string;
        quantity: number;
    }[];
}

export interface CartItem extends MenuItem {
    cartId: string;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    total: number;
    items: CartItem[];
    payment_method: string;
    tableId?: string;
    customerName?: string; // For online/takeout orders
    customerPhone?: string;
    orderType?: 'dine-in' | 'pickup' | 'delivery';
}

export interface Category {
    name: string;
    items: MenuItem[];
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string; // e.g., 'kg', 'packs', 'liters'
    threshold: number; // Low stock alert level
    costPerUnit?: number; // Cost price per unit
    category: string;
}

export interface Vendor {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    role: 'Manager' | 'Cashier' | 'Chef' | 'Waiter';
    hourlyRate: number;
    pin: string;
}

export interface PurchaseOrder {
    id: string;
    vendorId: string;
    items: {
        inventoryItemId: string;
        quantity: number;
        cost: number;
    }[];
    totalCost: number;
    status: 'Pending' | 'Ordered' | 'Received';
    synced?: boolean;
    created_at: string;
}

export type TableStatus = 'available' | 'occupied' | 'billed' | 'cleaning';

export interface Table {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rectangle' | 'circle';
    seats: number;
    status: TableStatus;
    currentOrderId?: string;
}

export interface Area {
    id: string;
    name: string;
    tables: Table[];
}
