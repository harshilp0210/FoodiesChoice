import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { MenuItem, Category } from './types';

export const getMenuData = async (): Promise<Category[]> => {
    const filePath = path.join(process.cwd(), 'public', 'menu.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
    });

    const categories: Record<string, MenuItem[]> = {};

    data.forEach((row: any, index: number) => {
        const categoryName = row['Category']?.trim();
        if (!categoryName) return;

        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }

        let price = row['Price_GBP'];
        if (typeof price === 'string') {
            price = parseFloat(price.replace(/[^0-9.]/g, ''));
        }

        let image = '/images/main_course.png'; // Fallback
        const catLower = categoryName.toLowerCase();

        if (catLower.includes('starter')) image = '/images/starters.png';
        else if (catLower.includes('soup') || catLower.includes('salad')) image = '/images/starters.png'; // Reuse for now
        else if (catLower.includes('street')) image = '/images/street_food.png';
        else if (catLower.includes('main')) image = '/images/main_course.png';
        else if (catLower.includes('south')) image = '/images/south_indian.png';
        else if (catLower.includes('chinese')) image = '/images/indo_chinese.png';
        else if (catLower.includes('bread') || catLower.includes('roti') || catLower.includes('naan')) image = '/images/main_course.png'; // Bread usually with curry
        else if (catLower.includes('dessert') || catLower.includes('ice cream')) image = '/images/dessert.png';
        // else if (catLower.includes('juice') || catLower.includes('drink') || catLower.includes('lassi')) image = '/images/drinks.png'; 

        categories[categoryName].push({
            id: `item-${index}`,
            category: categoryName,
            name: row['Item']?.trim(),
            price: price || 0,
            description: row['Notes']?.trim() || '',
            image,
            available: true,
        });
    });

    return Object.entries(categories).map(([name, items]) => ({
        name,
        items,
    }));
};
