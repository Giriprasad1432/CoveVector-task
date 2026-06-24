import mongoose from "mongoose";

const connectDB= async()=>{
    try{
        const conn=await mongoose.connect("mongodb://localhost:27017/ecommerce")
    }
    catch(err){
        console.log(err);
    }
}

export default connectDB;