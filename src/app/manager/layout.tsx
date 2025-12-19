"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Users,
    Truck,
    FileText,
    LogOut,
    Tags,
    ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Start KDS Mode', href: '/kitchen', icon: ClipboardList },
    { name: 'Inventory', href: '/manager/inventory', icon: Package },
    { name: 'Employees', href: '/manager/employees', icon: Users },
    { name: 'Menu & 86', href: '/manager/menu', icon: FileText }, // Using FileText or similar
    { name: 'Vendors', href: '/manager/vendors', icon: Truck },
    { name: 'Purchase Orders', href: '/manager/purchase-orders', icon: ClipboardList },
    { name: 'Tables & Floor', href: '/manager/floor-plan', icon: Users }, // Using Users icon as placeholder or suggest Grid/Layout
    { name: 'Deals/Offers', href: '/manager/deals', icon: Tags },
    { name: 'Reporting', href: '/manager/reports', icon: FileText },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'admin') {
            router.push('/'); // Redirect cashiers to POS
            return;
        }
    }, [isAuthenticated, user, router]);

    if (!isClient || !isAuthenticated || user?.role !== 'admin') {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mr-3">
                        FC
                    </div>
                    <span className="font-semibold text-white tracking-wide">Manager Portal</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                                        : "hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                    <div className="mt-4 px-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="text-xs">
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="opacity-50 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between shrink-0">
                    <h1 className="text-xl font-semibold text-slate-800">
                        {sidebarItems.find(i => pathname.startsWith(i.href))?.name || 'Dashboard'}
                    </h1>
                    <div className="text-sm text-slate-500">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
