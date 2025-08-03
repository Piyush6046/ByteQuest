import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Hello from backend🙌");
})


app.use("/api/v1/auth",authRoutes )
app.listen(process.env.PORT,()=>{
  console.log(`Server running on port ${process.env.PORT}`);
})