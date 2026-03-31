const User =require('../models/userModel')
const bcrypt=require('bcryptjs')
const jwt = require("jsonwebtoken");
exports.registerUser= async (req,res)=>{
    const { username,email,password}=req.body
    console.log("Register attempt with:", {username, email});
    
    //check user exists
    const userExist = await User.findOne({email})
    if(userExist) {
        console.log("User already exists for email:", email);
        return res.status(400).json({error: "user already exists"})
    }
    
    //hash password with proper salt rounds (10 is standard)
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Password hashed successfully");
    
    const newUser = new User({
        username,
        email,
        password:hashedPassword
    });
    
    await newUser.save()
    console.log("User registered successfully:", {username, email});
    
    res.json({message: "Registration successful", success: true})
};
exports.loginUser= async(req,res)=>{
    const {email,password}= req.body
    console.log("Login attempt with email:", email);
    
    const user= await User.findOne({email})
    if(!user) {
        console.log("User not found for email:", email);
        return res.status(400).json({error: "User does not exist"})
    }

    console.log("User found:", {username: user.username, email: user.email});
    
    const isMatch= await bcrypt.compare(password,user.password)
    if(!isMatch) {
        console.log("Password mismatch for user:", email);
        return res.status(400).json({error: "Incorrect password"})
    }
    
    console.log("Password matched, generating token...");
    
    //create JWT TOKEN
    const token= jwt.sign(
        {
            id:user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )
    
    console.log("Login successful for:", {username: user.username, email: user.email});
    
    //send token with username
    res.json({
        message:"login successful",
        success: true,
        token,
        username: user.username,
        email: user.email
    })
}
  
