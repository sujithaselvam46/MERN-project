const User =require('../models/userModel')
const bcrypt=require('bcryptjs')
const jwt = require("jsonwebtoken");
exports.registerUser= async (req,res)=>{
    const { username,email,password}=req.body
    //check user exists
    const userExist = await User.findOne({email})
    if(userExist)
        return res.send("user already exists")
    //hash password
    const hashedPassword = await bcrypt.hash(password,15)
    const newUser = new User({
        username,
        email,
        password:hashedPassword

    });
    await newUser.save()
    res.send("Registration successfull")
};
exports.loginUser= async(req,res)=>{
    const {email,password}= req.body
    const user= await User.findOne({email})
    if(!user) return res.send("User does not exist")

    const isMatch= await bcrypt.compare(password,user.password)
    if(!isMatch) return res.send("Incorrect password")
        //create JWT TOKEN
        const token= jwt.sign(
            {
                id:user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        )
        
        //send token(insted of redirect)
        res.json({
            message:"login successful",
            token
        })
      

}
  
