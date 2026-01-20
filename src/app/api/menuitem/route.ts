import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoConnect';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

/**
 * API Configuration
 * Disables Next.js default body parser to handle FormData with file uploads
 */

/**
 * Menu Item Database Interface
 * Defines the structure of menu items stored in MongoDB
 */
interface MenuItemDB {
    name: string;                                           // Item name (required)
    description?: string;                                   // Optional item description
    basePrice: number;                                      // Base price without extras
    category: string;                                       // Food category (e.g., Pizza, Burger)
    sizeOptions: { name: string; extraPrice: number }[];    // Size variations with pricing
    extraIngredients: { name: string; extraPrice: number }[]; // Additional ingredients with costs
    imageUrl?: string;                                      // Optional image path
    createdAt: Date;                                        // Record creation timestamp
    updatedAt: Date;                                        // Last update timestamp
}

/**
 * Database Collection Helper
 * Establishes connection and returns the menu items collection
 * @returns {Promise<Collection<MenuItemDB>>} MongoDB collection instance
 */
async function getCollection() {
    const client = await clientPromise.connect();
    return client.db().collection<MenuItemDB>('menuitems');
}

/**
 * Form Data Parser Helper
 * Parses JSON string from form data for array fields (sizeOptions, extraIngredients)
 * @param {FormData} form - Form data object
 * @param {string} key - Field name to parse
 * @returns {Promise<{name: string, extraPrice: number}[]>} Parsed array of options
 */
async function parseOptions(form: FormData, key: string) {
    const s = form.get(key)?.toString() || '[]';
    return JSON.parse(s) as { name: string; extraPrice: number }[];
}

/**
 * GET /api/menu-items
 * Retrieves all menu items from database
 * @returns {Promise<NextResponse>} JSON array of menu items, sorted by creation date (newest first)
 */
export async function GET() {
    try {
        const col = await getCollection();
        const items = await col.find().sort({ createdAt: -1 }).toArray();
        return NextResponse.json(items);
    } catch (error) {
        console.error('GET menu items error:', error);
        return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }
}

/**
 * POST /api/menu-items
 * Creates a new menu item with optional image upload
 * @param {NextRequest} req - Request object containing FormData
 * @returns {Promise<NextResponse>} Newly created menu item with _id
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const form = await req.formData();
        const col = await getCollection();

        // Extract basic form fields
        const name = form.get('name')?.toString() || '';
        const basePrice = parseFloat(form.get('basePrice')?.toString() || '0');
        const category = form.get('category')?.toString() || '';
        const description = form.get('description')?.toString() || '';

        // Parse array fields from JSON strings
        const sizeOptions = await parseOptions(form, 'sizeOptions');
        const extraIngredients = await parseOptions(form, 'extraIngredients');

        let imageUrl: string | undefined;
        const file = form.get('image') as Blob | null;

        // Handle image upload if present
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), 'public/uploads');

            // Ensure upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Generate unique filename with timestamp and file extension
            const filename = `${Date.now()}-${file.type.replace('/', '.')}`;
            fs.writeFileSync(path.join(uploadDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
        }

        // Construct menu item object
        const item: MenuItemDB = {
            name,
            description,
            basePrice,
            category,
            sizeOptions,
            extraIngredients,
            imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Insert into database
        const result = await col.insertOne(item);
        return NextResponse.json({ _id: result.insertedId, ...item });

    } catch (error) {
        console.error('POST menu item error:', error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}

/**
 * PUT /api/menu-items
 * Updates an existing menu item with optional image replacement
 * @param {NextRequest} req - Request object containing FormData with item ID and updates
 * @returns {Promise<NextResponse>} Updated menu item or error response
 */
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const form = await req.formData();
        const id = form.get('id')?.toString() || '';

        // Validate MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Construct update object with basic fields
        const update: Partial<MenuItemDB> = {
            name: form.get('name')?.toString() || '',
            description: form.get('description')?.toString() || '',
            basePrice: parseFloat(form.get('basePrice')?.toString() || '0'),
            category: form.get('category')?.toString() || '',
            sizeOptions: JSON.parse(form.get('sizeOptions')?.toString() || '[]'),
            extraIngredients: JSON.parse(form.get('extraIngredients')?.toString() || '[]'),
            updatedAt: new Date(),
        };

        const file = form.get('image') as Blob | null;

        // Handle new image upload if provided
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), 'public/uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filename = `${Date.now()}-${file.type.replace('/', '.')}`;
            fs.writeFileSync(path.join(uploadDir, filename), buffer);
            update.imageUrl = `/uploads/${filename}`;
        }

        const col = await getCollection();

        // Perform update and return modified document
        const result = await col.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: update },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('PUT menu item error:', error);
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}

/**
 * DELETE /api/menu-items
 * Removes a menu item from the database
 * @param {NextRequest} req - Request object containing JSON with item ID
 * @returns {Promise<NextResponse>} Success confirmation or error response
 */
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await req.json();

        // Validate MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const col = await getCollection();
        const { deletedCount } = await col.deleteOne({ _id: new ObjectId(id) });

        if (!deletedCount) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('DELETE menu item error:', error);
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}