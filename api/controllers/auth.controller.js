import bcrypt from "bcrypt";
import prisma from "./../lib/prisma.js";

import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = await req?.body;



  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    res.status(201).json({ message: "User created!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating user!" });
  }
};

export const login = async (req, res) => {
    const { email, password } = req?.body;
    console.log(email, password)
  try {

    const user = await prisma.user.findUnique({
        where : {
            email : email
        }
    })

    console.log(user)

    const {password : userPassword , ...userInfo} = user;
    
    if(!user){
       return res.status(401).json({message : "Invalid Credentials!"})
    }

    const isPasswordCorrect = await bcrypt.compare(password, user?.password);
    console.log(isPasswordCorrect)

    if(!isPasswordCorrect){
        return res.status(401).json({message : "Invalid Credentials!"})
    }

    // res.setHeader("Set-Cookie", "test=" + "myValue" ).json("sucess")
    const age = 60 * 60 * 24 * 7;

    const token = jwt.sign({
        id : user?.id,
    }, process.env.JWT_SECRET_KEY,
    {
        expiresIn : age
    }
    )

    res.cookie("token", token, {
        httpOnly : true,
        // secure : true,
        maxAge : age,
        
    }).status(200).json({message : "Logged in!",
    user : userInfo})

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error logging in!" });
  }
};

export const logout = (req, res) => {
    res.clearCookie("token").json({message : "Logged out!"})
};
