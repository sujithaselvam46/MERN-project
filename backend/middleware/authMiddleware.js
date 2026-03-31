
const jwt=require("jsonwebtoken")
module.exports = (req,res,next)=>{
    const token = req.header("Authorization")?.split(" ")[1]
    if(!token){
        return res.status(401).json({error: "Access denied"})
    }
    try{
        const verified = jwt.verify(token,process.env.JWT_SECRET)
        req.user=verified
        req.userId = verified.id
        console.log("Auth middleware - User ID:", req.userId);
        next()

    }
    catch(err){
        console.error("Token verification error:", err.message);
        res.status(400).json({error:"Invalid token"})
    }
}