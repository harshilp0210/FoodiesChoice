import { Order, CartItem, InventoryItem, Vendor, Employee, PurchaseOrder, MenuItem } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock Supabase Client for "Mock Mode"
// Utilizes localStorage to persist orders across page reloads (simulating a database)

const STORAGE_KEY = 'foodies_pos_orders';

// --- Offline Sync Mock ---
const OFFLINE_QUEUE_KEY = 'foodies_pos_offline_queue';

export const getOfflineQueue = (): Order[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const syncOrders = async (): Promise<number> => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return 0;

    // Move from Offline Queue to Main Storage
    const existingOrders = getOrdersLocal();
    const newOrders = [...queue, ...existingOrders];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
    localStorage.removeItem(OFFLINE_QUEUE_KEY);

    // Dispatch events
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(newOrders)
    }));

    return queue.length;
};

export const saveOrder = async (
    itemsOrOrder: CartItem[] | Order,
    total?: number,
    paymentMethod?: string,
    tableId?: string
): Promise<Order | null> => {
    try {
        let newOrder: Order;

        if (Array.isArray(itemsOrOrder)) {
            // Legacy Usage (POS)
            newOrder = {
                id: uuidv4(),
                created_at: new Date().toISOString(),
                status: 'pending',
                total: total || 0,
                items: itemsOrOrder,
                payment_method: paymentMethod || 'cash',
                tableId,
            };
        } else {
            // New Usage (Online Order object passed directly)
            newOrder = itemsOrOrder;
        }

        // Offline Detection
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            console.log("Offline! saving to queue.");
            const queue = getOfflineQueue();
            queue.push(newOrder);
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            return newOrder;
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const existingOrders = getOrdersLocal();
        const updatedOrders = [newOrder, ...existingOrders];

        // Deduct Inventory based on Recipes
        const inventory = getInventory();
        let inventoryUpdated = false;

        newOrder.items.forEach(item => {
            if (item.recipe && item.recipe.length > 0) {
                item.recipe.forEach(ingredient => {
                    const invItem = inventory.find(i => i.id === ingredient.inventoryItemId);
                    if (invItem) {
                        invItem.quantity = Math.max(0, invItem.quantity - (ingredient.quantity * item.quantity));
                        inventoryUpdated = true;
                    }
                });
            }
        });

        if (inventoryUpdated) {
            localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
        }

        // Update table status if applicable
        if (tableId) {
            // Find which area and table this belongs to
            const layout = getLayout();
            for (const area of layout) {
                const table = area.tables.find(t => t.id === tableId);
                if (table) {
                    updateTableStatus(area.id, table.id, 'occupied');
                    break;
                }
            }
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
            // Dispatch event for KDS to pick up changes in other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: STORAGE_KEY,
                newValue: JSON.stringify(updatedOrders)
            }));

            if (inventoryUpdated) {
                // Notify inventory updated
                window.dispatchEvent(new Event('inventory_updated'));
            }
        }

        return newOrder;
    } catch (error) {
        console.error("Error saving order:", error);
        return null;
    }
};

export const getOrders = async (): Promise<Order[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getOrdersLocal();
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const orders = getOrdersLocal();
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('orders_updated'));
    }
}

// Helper to get from local storage without async
export const getOrdersLocal = (): Order[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Subscription helper (polling + event listener)
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    if (typeof window === 'undefined') return () => { };

    // Initial load
    callback(getOrdersLocal());

    const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY || e.key === null) {
            callback(getOrdersLocal());
        }
    };

    const handleCustom = () => {
        callback(getOrdersLocal());
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('orders_updated', handleCustom);

    // Poll every 5 seconds just in case
    const interval = setInterval(() => {
        callback(getOrdersLocal());
    }, 5000);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('orders_updated', handleCustom);
        clearInterval(interval);
    };
};

// --- Inventory Mock ---
const INVENTORY_KEY = 'foodies_pos_inventory';
const VENDORS_KEY = 'foodies_pos_vendors';

export const getInventory = (): InventoryItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(INVENTORY_KEY);
    if (!stored) {
        // Default Mock Data
        const defaults: InventoryItem[] = [
            { id: 'inv-1', name: 'Tomatoes', quantity: 20, unit: 'kg', threshold: 5, category: 'Produce' },
            { id: 'inv-2', name: 'Mozzarella Cheese', quantity: 8, unit: 'blocks', threshold: 10, category: 'Dairy' },
            { id: 'inv-3', name: 'Pizza Dough Flour', quantity: 50, unit: 'kg', threshold: 20, category: 'Dry Goods' },
            { id: 'inv-4', name: 'Olive Oil', quantity: 5, unit: 'L', threshold: 2, category: 'Pantry' },
        ];
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(stored);
};

export const updateInventoryItem = (item: InventoryItem) => {
    const items = getInventory();
    const idx = items.findIndex(i => i.id === item.id);
    let newItems;
    if (idx >= 0) {
        newItems = items.map(i => i.id === item.id ? item : i);
    } else {
        newItems = [...items, item];
    }
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(newItems));
    return newItems;
};

export const deleteInventoryItem = (id: string) => {
    const items = getInventory();
    const newItems = items.filter(i => i.id !== id);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(newItems));
    return newItems;
};

// --- Vendors Mock ---
export const getVendors = (): Vendor[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(VENDORS_KEY);
    if (!stored) {
        // Default Mock Data
        const defaults: Vendor[] = [
            { id: 'ven-1', name: 'Fresh Farm Produce', contactName: 'Jim', email: 'orders@freshfarm.com', phone: '555-0101', address: '123 Farm Ln' },
            { id: 'ven-2', name: 'Dairy Best', contactName: 'Sarah', email: 'sales@dairybest.com', phone: '555-0102', address: '456 Milk Way' },
        ];
        localStorage.setItem(VENDORS_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(stored);
};

export const saveVendor = (vendor: Vendor) => {
    const vendors = getVendors();
    const idx = vendors.findIndex(v => v.id === vendor.id);
    let newVendors;
    if (idx >= 0) {
        newVendors = vendors.map(v => v.id === vendor.id ? vendor : v);
    } else {
        newVendors = [...vendors, vendor];
    }
    localStorage.setItem(VENDORS_KEY, JSON.stringify(newVendors));
    return newVendors;
};

export const deleteVendor = (id: string) => {
    const vendors = getVendors();
    const newVendors = vendors.filter(v => v.id !== id);
    localStorage.setItem(VENDORS_KEY, JSON.stringify(newVendors));
    return newVendors;
};

// --- Employee Mock ---
const EMPLOYEES_KEY = 'foodies_pos_employees';
const PO_KEY = 'foodies_pos_purchase_orders';

export const getEmployees = (): Employee[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    if (!stored) {
        const defaults: Employee[] = [
            { id: 'emp-1', firstName: 'John', lastName: 'Doe', role: 'Manager', hourlyRate: 25, pin: '1234' },
            { id: 'emp-2', firstName: 'Jane', lastName: 'Smith', role: 'Cashier', hourlyRate: 15, pin: '5678' },
        ];
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(stored);
};

export const saveEmployee = (employee: Employee) => {
    const list = getEmployees();
    const idx = list.findIndex(e => e.id === employee.id);
    let newList;
    if (idx >= 0) {
        newList = list.map(e => e.id === employee.id ? employee : e);
    } else {
        newList = [...list, employee];
    }
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(newList));
    return newList;
};

export const deleteEmployee = (id: string) => {
    const list = getEmployees();
    const newList = list.filter(e => e.id !== id);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(newList));
    return newList;
};

// --- Purchase Orders Mock ---
export const getPurchaseOrders = (): PurchaseOrder[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PO_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const savePurchaseOrder = (po: PurchaseOrder) => {
    const list = getPurchaseOrders();
    const idx = list.findIndex(p => p.id === po.id);
    let newList;
    if (idx >= 0) {
        newList = list.map(p => p.id === po.id ? po : p);
    } else {
        newList = [...list, po];
    }
    localStorage.setItem(PO_KEY, JSON.stringify(newList));
    return newList;
};

// --- Mock Floor Plan ---
import { Area, TableStatus } from './types';

export const getLayout = (): Area[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('restaurant_layout');
    if (stored) return JSON.parse(stored);

    // Default layout if empty
    return [
        {
            id: 'main-hall',
            name: 'Main Dining',
            tables: [
                { id: 't1', label: '1', x: 20, y: 20, width: 80, height: 80, shape: 'rectangle', seats: 4, status: 'available' },
                { id: 't2', label: '2', x: 120, y: 20, width: 80, height: 80, shape: 'rectangle', seats: 4, status: 'occupied' },
            ]
        }
    ];
};

export const saveLayout = (layout: Area[]) => {
    localStorage.setItem('restaurant_layout', JSON.stringify(layout));
};

export const updateTableStatus = (areaId: string, tableId: string, status: TableStatus) => {
    const layout = getLayout();
    const area = layout.find(a => a.id === areaId);
    if (area) {
        const table = area.tables.find(t => t.id === tableId);
        if (table) {
            table.status = status;
            saveLayout(layout);
        }
    }
    return layout;
};

// --- Menu Management Mock ---
const MENU_OVERRIDES_KEY = 'foodies_pos_menu_overrides';

export interface MenuOverride {
    id: string;
    available?: boolean;
    price?: number;
    recipe?: {
        inventoryItemId: string;
        quantity: number;
    }[];
}

export const getMenuOverrides = (): Record<string, MenuOverride> => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(MENU_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
};

export const updateMenuItemOverride = (id: string, updates: Partial<MenuOverride>) => {
    const overrides = getMenuOverrides();
    overrides[id] = { ...(overrides[id] || { id }), ...updates };
    localStorage.setItem(MENU_OVERRIDES_KEY, JSON.stringify(overrides));

    // Notify components
    window.dispatchEvent(new CustomEvent('menu_updated'));
    return overrides;
};
