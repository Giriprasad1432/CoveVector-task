import connectDB from "./config/db.js";
import express from "express";
import { getCategories,getProducts } from "./controllers/searchController.js";
import cors from 'cors'

const app = express();

app.use(express.json())

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.get('/products',getProducts)
app.get('/categories',getCategories)

connectDB();

app.listen(3000, () => {
    console.log("server is running on port 3000");
})