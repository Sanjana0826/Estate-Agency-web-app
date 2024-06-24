import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // create user and save to db
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);
    res.status(201).json({message:"User created successfully"});
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  
    const {username, password} = req.body;


    try{
    // check if user exists

    const user = await prisma.user.findUnique({
        where:{username}
    })

    if(!user) return res.status(401).json({message:"Invalid Credentials"});

    // check if password correct

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) return res.status(401).json({message:"Invalid Credentials"});



    // generate cookie token and send to the user 

    const age = 1000 * 60 * 60 * 24 * 7

    const token = jwt.sign({
        id: user.id
    },process.env.JWT_SECRET_KEY,{expiresIn: age});

    
    res.cookie("token",token,{
        httpOnly:true,
        // secure:true,
        maxAge: age,
    }).status(200).json({message: "Login Successful"});



    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success");


    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to login"})
    }

};
export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({message: "Logout Successfully"});
};
