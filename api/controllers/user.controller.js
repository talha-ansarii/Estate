import prisma from "../lib/prisma.js"
import bcrypt from "bcrypt"

export const getUsers = async (req, res) => {
    try{

        const users = await prisma.user.findMany()
        console.log(users)
        res.status(200).json(users)
    }catch(err){
        console.log(err)
        res.status(500).json({message : "Error fetching users"})
    }
}


export const getUser = async (req, res) => {
    try{
        const id = req.params.id
        const user = await prisma.user.findUnique({
            where : {
                id : id
            }
        })
        console.log(user)
        res.status(200).json(user)

    }catch(err){
        console.log(err)
        res.status(500).json({message : "Error fetching user"})
    }
}




export const updateUser = async (req, res) => {
    const id = req.params.id
    const tokenUserId = req.userId
    const {password, avatar, ...inputs} =await req?.body;
    
    if(tokenUserId !== id){
        return res.status(401).json({message : "You are not allowed to update this user"})
    }
    let hashedPassword = null;
    if(password){
        hashedPassword = await bcrypt.hash(password, 10)
    }

    try{
        const updatedUser = await prisma.user.update({
            where : {
                id : id
            },

            data : {
                ...inputs,
                ...(hashedPassword && {password : hashedPassword}),
                ...(avatar && {avatar : avatar})
            }
        })
        const {password: userPassword, ...rest} = updatedUser
        res.status(200).json(rest)


    }catch(err){
        console.log(err)
        res.status(500).json({message : "Error updating user"})
    }
}







export const deleteUser = async (req, res) => {

    const id = req.params.id
    const tokenUserId = req.userId
    
    if(tokenUserId !== id){
        return res.status(401).json({message : "You are not allowed to delete this user"})
    }
    try{

        await prisma.user.delete({
            where : {
                id : id
            }
        })  

        res.status(200).json({message : "User deleted!"})

    }catch(err){
        console.log(err)
        res.status(500).json({message : "Error deleting user"})
    }
}


export const savePost = async (req, res) => {
    const postId = req.body.postId;
    const tokenUserId = req.userId;
  
    try {
      const savedPost = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: tokenUserId,
            postId,
          },
        },
      });
  
      if (savedPost) {
        await prisma.savedPost.delete({
          where: {
            id: savedPost.id,
          },
        });
        res.status(200).json({ message: "Post removed from saved list" });
      } else {
        await prisma.savedPost.create({
          data: {
            userId: tokenUserId,
            postId,
          },
        });
        res.status(200).json({ message: "Post saved" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to delete Save Post!" });
    }
  };


  export const profilePosts = async (req, res) => {
    const tokenUserId = req.userId;
    try {
      const userPosts = await prisma.post.findMany({
        where: { userId: tokenUserId },
      });
      const saved = await prisma.savedPost.findMany({
        where: { userId: tokenUserId },
        include: {
          post: true,
        },
      });
  
      const savedPosts = saved.map((item) => item.post);
      
      res.status(200).json({ userPosts, savedPosts });


    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get profile posts!" });
    }
  };

