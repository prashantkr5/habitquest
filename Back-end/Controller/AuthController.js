const { signupValidation } = require('../Middlewares/AuthValidation');

const bcrypt = require('bcryptjs');
const UserModel = require('../Models/User');
const jwt = require('jsonwebtoken');

const signup = async (req, res)=>{
    try {
        const {name, email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(user){
            return res.status(409).json({message : "User is already registered bro..! LOGIN"})
        }
        const userModel = new UserModel({name, email, password});
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201).json({
            message: 'Signup Successful bro..!',
            success: true
        
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error", error,
            success: false
        })
        
    }
}


const login = async (req, res)=>{
    try {
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(403).json({message : "Email or password is wrong.",
                success: false
            })
        }
        const isPasswordEqual = await bcrypt.compare(password, user.password);
        if(!isPasswordEqual){
            return res.status(403).json({message : "Email or password is wrong bro..!",
                success: falses
            });
        }

        const jwtToken = jwt.sign({email: user.email, _id: user._id, },
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        )

        res.status(200).json({
            message: 'Login Successful bro..!',
            success: true,
            token: jwtToken,
            email,
            name: user.name
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error", error,
            success: false
        })
        
    }
}



module.exports={
    signup, login
}

