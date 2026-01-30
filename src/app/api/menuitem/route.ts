import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoConnect';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { z } from "zod";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MenuItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().default(""),
    basePrice: z.coerce.number().min(0, "Base price must be positive"),
    discountPrice: z.coerce.number().min(0, "Discount price must be positive").optional(),
    category: z.string().optional().default(""),
    sizeOptions: z.string().optional().default("[]").transform((str) => {
        try {
            return JSON.parse(str);
        } catch {
            return [];
        }
    }).pipe(z.array(z.object({
        name: z.string(),
        extraPrice: z.coerce.number()
    }))),
    extraIngredients: z.string().optional().default("[]").transform((str) => {
        try {
            return JSON.parse(str);
        } catch {
            return [];
        }
    }).pipe(z.array(z.object({
        name: z.string(),
        extraPrice: z.coerce.number()
    })))
});

import { MenuItemDB } from '@/types/menu';

/**
 * Database Collection Helper
 * Establishes connection and returns the menu items collection.
 */
async function getCollection() {
    const client = await clientPromise;
    return client.db().collection<MenuItemDB>('menuitems');
}



/**
 * GET /api/menu-items
 * Retrieves all menu items from database, sorted by newest first.
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
 * Creates a new menu item with optional image upload.
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

        // Convert FormData to standard object for Zod validation
        const formDataObj = Object.fromEntries(form.entries());
        const validation = MenuItemSchema.safeParse(formDataObj);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const {
            name,
            description,
            basePrice,
            category,
            sizeOptions,
            extraIngredients
        } = validation.data;

        let imageUrl: string | undefined;
        let cloudinaryPublicId: string | undefined;
        const file = form.get('image') as Blob | null;

        // Handle image upload if present
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());

            // Convert to base64
            const base64 = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${base64}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: 'auto',
                folder: 'pizza-delivery/menuitems',
            });

            imageUrl = result.secure_url;
            cloudinaryPublicId = result.public_id;
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
            cloudinaryPublicId,
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
 * Updates an existing menu item with optional image replacement.
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

        // Convert FormData to standard object for Zod validation
        const formDataObj = Object.fromEntries(form.entries());
        const validation = MenuItemSchema.safeParse(formDataObj);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        // Construct update object with basic fields
        const update: Partial<MenuItemDB> = {
            ...validation.data,
            updatedAt: new Date(),
        };

        const file = form.get('image') as Blob | null;

        // Handle new image upload if provided
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());

            // Convert to base64
            const base64 = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${base64}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: 'auto',
                folder: 'pizza-delivery/menuitems',
            });

            update.imageUrl = result.secure_url;
            update.cloudinaryPublicId = result.public_id;
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
 * Removes a menu item from the database and deletes its image from Cloudinary.
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
        const db = (await clientPromise).db();

        // Get the menu item to retrieve its image URL before deletion
        const item = await col.findOne({ _id: new ObjectId(id) });

        if (!item) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        // Check if menu item is referenced in any orders
        const ordersWithItem = await db.collection("orders").countDocuments({
            "cart._id": id
        });

        if (ordersWithItem > 0) {
            return NextResponse.json(
                { error: `Cannot delete menu item used in ${ordersWithItem} orders. Mark as inactive instead or delete orders first.` },
                { status: 400 }
            );
        }

        // Delete image from Cloudinary if it exists
        if (item.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(item.cloudinaryPublicId);
            } catch (cloudinaryError) {
                console.error('Error deleting image from Cloudinary:', cloudinaryError);
                // Continue with deletion even if Cloudinary deletion fails
            }
        }

        // Delete from database
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