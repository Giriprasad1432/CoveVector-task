import { Schema, model } from "mongoose";

const productModel = new Schema({
    productId: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
})

const product = model("products", productModel)

export default product;