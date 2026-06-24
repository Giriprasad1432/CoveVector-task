import mongoose from "mongoose";
import connectDB from "./config/db.js";
import product from "./models/productModel.js";

await connectDB();

const seed = async () => {
    try {
        console.log('seeding database...')
        const batch = 200;
        const categories = ['Electronics', 'books', 'toys', 'Fashion', 'Cookware', 'Grocery']
        const baseTime= Date.now();

        for (let i = 0; i < batch; i++) {
            const products = [];
            for (let j = 1; j <= 1000; j++) {
                const id = i * 1000 + j;
                const staggeredDate = new Date(baseTime - id * 60000);
                products.push({
                    productId: `PROD-${String(id).padStart(6, '0')}`,
                    name: `Product-${id}`,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    price: parseFloat((Math.random() * 1000 + id * 0.05).toFixed(2)),
                    created_at: staggeredDate,
                    updated_at: staggeredDate
                })
            }
            await product.insertMany(products, { ordered: false, lean: true });
        }

        console.log("Creating compound index...");
        await product.collection.createIndex({ category: 1, created_at: -1, _id: -1 }, { collation: { locale: 'en', strength: 2 } });
        console.log("Index created successfully!");

    } catch (err) {
        console.log(err)
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }

}

seed();