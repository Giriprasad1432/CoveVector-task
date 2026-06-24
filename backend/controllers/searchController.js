import mongoose from "mongoose";
import product from "../models/productModel.js";

export const getProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 50;
        const category = req.query.category || null;
        const search = req.query.search || null;
        const next_cursor = req.query.next_cursor || null; 

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.name = { $regex: search, $options: "i" }; 
        }

        if (next_cursor) {
            const [cursorTime, cursorId] = next_cursor.split("_");
            const lastCreatedAt = new Date(cursorTime);
            const lastId = new mongoose.Types.ObjectId(cursorId);

            filter.$or = [
                { created_at: { $lt: lastCreatedAt } },
                { created_at: lastCreatedAt, _id: { $lt: lastId } }
            ];
        }

        const products = await product.find(filter)
            .sort({ category: 1, created_at: -1, _id: -1 })
            .collation({ locale: 'en', strength: 2 })
            .limit(limit + 1)
            .lean();

        const has_more = products.length > limit;

        if (has_more) {
            products.pop(); 
        }

        let newCursorToken = null;
        if (products.length > 0) {
            const lastItem = products[products.length - 1];
            const dateStr = lastItem.created_at instanceof Date 
                ? lastItem.created_at.toISOString() 
                : new Date(lastItem.created_at).toISOString();
                
            newCursorToken = `${dateStr}_${lastItem._id}`;
        }

        console.log("products Request successful")

        return res.status(200).json({
            products,
            next_cursor: has_more ? newCursorToken : null,
            has_more
        });

    } catch (error) {
        console.error("getProducts error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await product.distinct("category");

        return res.status(200).json({
            categories: categories.sort()
        });

    } catch (error) {
        console.error("getCategories error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
