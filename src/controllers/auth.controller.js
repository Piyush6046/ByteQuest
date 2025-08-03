import bcrypt  from "bcryptjs";
import {db} from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken"

export const register = async(req,res)=>{
  const {name,email,password} = req.body
  try {
    const existingUser = await db.user.findUnique({where:{email}})
    if(existingUser){
      return res.status(400).json({message:"User already exists"})
    }

    const hashedPassword = await bcrypt.hash(password,10)
    const newUser = await db.user.create({
      data:{name,email,password:hashedPassword,role:UserRole.USER}
    })


    const token = jwt.sign({userId:newUser.id},process.env.JWT_SECRET,{expiresIn:"7d"})
    res.cookie("jwt",token,
      {
      httpOnly:true,
      sameSite :"strict",
      secure:process.env.NODE_ENV !== "development",
      maxAge:7*24*60*60*1000})
    res.status(201).json({
       success:true,
      message:"User registered successfully",

      id:newUser.id,
      name:newUser.name,
      email:newUser.email,
      role:newUser.role,
      image:newUser.image
    })
    } catch (error) {
    console.log(error)
    res.status(500).json({message:"Error registering user"})

  }
}

export const login = async(req,res)=>{
  const {email,password} = req.body;
  try {
    const user= await db.user.findUnique({where:{email}})
    if(!user){
      return res.status(404).json({message:"User not found"})
    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
      return res.status(401).json({message:"Invalid credentials"})
    }
    const token = jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:"7d"})
    res.cookie("jwt",token,
      {
      httpOnly:true,
      sameSite :"strict",
      secure:process.env.NODE_ENV !== "development",
      maxAge:7*24*60*60*1000})

    res.status(200).json({
       success:true,
      message:"User logged in successfully",
      id:user.id,
      name:user.name,
      email:user.email,
      role:user.role,
      image:user.image
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Error logging in user"})
  }
}

export const logout = async(req,res)=>{
    try {
      res.clearCookie("jwt")
      res.status(200).json({
        success:true,
        message:"User logged out successfully"})
    } catch (error) {
      console.log(error)
      res.status(500).json({message:"Error logging out user"})
    }
}

export const check = async(req,res)=>{
  try {
    const user = req.user
    res.status(200).json({
      success:true,
      message:"User authenticated successfully",
      id:user.id,
      name:user.name,
      email:user.email,
      role:user.role,
      image:user.image
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Error checking user"})
  }
}
