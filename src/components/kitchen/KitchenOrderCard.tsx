import { Order } from '@/lib/types';
import { Clock, CheckCircle, Play, Utensils, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
    order: Order;
    onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

export default function KitchenOrderCard({ order, onStatusUpdate }: KitchenOrderCardProps) {
    const [elapsed, setElapsed] = useState('');
    const [minutes, setMinutes] = useState(0);

    useEffect(() => {
        const updateTime = () => {
            const created = new Date(order.created_at);
            setElapsed(formatDistanceToNow(created, { addSuffix: true }));
            setMinutes(differenceInMinutes(new Date(), created));
        };
        updateTime();
        const interval = setInterval(updateTime, 10000); // Update every 10s for better precision
        return () => clearInterval(interval);
    }, [order.created_at]);

    // Color Coding Logic
    let statusColor = "bg-green-500/10 border-green-200";
    let textColor = "text-green-700";

    if (minutes >= 20) {
        statusColor = "bg-red-500/10 border-red-200 animate-pulse";
        textColor = "text-red-700";
    } else if (minutes >= 10) {
        statusColor = "bg-yellow-500/10 border-yellow-200";
        textColor = "text-yellow-700";
    }

    const getStatusBadge = () => {
        switch (order.status) {
            case 'pending': return <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">New</span>;
            case 'preparing': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse">Cooking</span>;
            case 'ready': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Ready</span>;
            default: return null;
        }
    };

    return (
        <div className={cn("bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col h-full transition-all duration-300", minutes >= 20 ? "border-red-400 shadow-red-100" : "border-border")}>
            <div className={cn("p-3 border-b flex justify-between items-center", statusColor)}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order #{order.id.slice(0, 4)}</span>
                        {getStatusBadge()}
                    </div>
                    {order.tableId === 'online' ? (
                        <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded w-fit flex items-center gap-1">
                            PICKUP • {order.customerName || 'Guest'}
                        </div>
                    ) : (
                        order.tableId && <div className="text-xs font-semibold bg-white/50 px-1.5 py-0.5 rounded w-fit">Table {order.tableId}</div>
                    )}
                </div>
                <div className={cn("flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm", textColor)}>
                    {minutes >= 20 && <AlertCircle className="w-3.5 h-3.5" />}
                    <Clock className="w-3.5 h-3.5" />
                    {elapsed}
                </div>
            </div>

            <div className="p-4 flex-1">
                <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                            <span className="font-bold text-lg w-8 shrink-0 bg-muted/30 text-center rounded h-8 leading-8">{item.quantity}</span>
                            <div className="flex-1">
                                <span className={cn("font-bold text-base", order.status === 'ready' ? "line-through text-muted-foreground" : "")}>{item.name}</span>
                                {item.notes && (
                                    <p className="text-xs text-red-600 bg-red-50 p-1 rounded mt-1 border border-red-100">Note: {item.notes}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-3 bg-muted/30 border-t border-border mt-auto grid grid-cols-1 gap-2">
                {order.status === 'pending' && (
                    <button
                        onClick={() => onStatusUpdate(order.id, 'preparing')}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all active:scale-[0.98] shadow-sm"
                    >
                        <Utensils className="w-5 h-5" />
                        Start Cooking
                    </button>
                )}
                {order.status === 'preparing' && (
                    <button
                        onClick={() => onStatusUpdate(order.id, 'ready')}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all active:scale-[0.98] shadow-sm"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Order Ready
                    </button>
                )}
                {order.status === 'ready' && (
                    <button
                        onClick={() => onStatusUpdate(order.id, 'completed')}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-bold transition-all active:scale-[0.98] shadow-sm"
                    >
                        <Play className="w-5 h-5" />
                        Complete / Bump
                    </button>
                )}
            </div>
        </div>
    );
}
