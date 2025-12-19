import { NextResponse } from 'next/server';
import { getMenuData } from '@/lib/menu-data';

export async function GET() {
    try {
        const data = await getMenuData();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
    }
}
