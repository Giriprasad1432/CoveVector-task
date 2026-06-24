import mongoose from "mongoose";
import connectDB from "./config/db";
import product from "./models/productModel";

connectDB();

const seed = async() => {
    const batch=200;
    const categories=['Electronics','books','toys','Fashion','Cookware','Grocery']
    for(let i=1; i<=batch ;i++){
        const products=[];
        for(let j=1;j<=1000;j++){
            const id=i*1000+j;
            products.push({
                productId:`PROD-${String(id).padStart(6,'0')}`,
                name:`Product-${batch*id}`,
                category: categories[Math.floor(Math.random()*categories.length)],
                price:Math.random()*1000+id*50
            })
        }
        await product.insertMany(products);
    }

}

seed();