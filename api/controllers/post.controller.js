import prisma from "../lib/prisma.js"
import jwt from "jsonwebtoken"




export const getPosts = async (req, res) => {
    const query = req.query
    console.log(query)
    try {

        const posts = await prisma.post.findMany({
            where:{
                city : query.city || undefined,
                type : query.type || undefined,
                property : query.property || undefined,
                bedroom : parseInt(query.bedroom) || undefined,
                price :{
                    gte : parseInt(query.minPrice) || 0,
                    lte : parseInt(query.maxPrice) || 100000000 
                }
            }
        })

 
        console.log(posts)
        
        res.status(200).json(posts)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Failed to get posts"})
    }
}; 






export const getPost = async (req, res) => {
    const id = req?.params?.id;
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: id
            },
            include : {
                postDetails : true,
                user : {
                    select : {
                        username : true,
                        avatar : true
                    }
                }
            }
        })
  
      const token = req?.cookies?.token;
  
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
          if (!err) {
            try {
              const saved = await prisma?.savedPost.findUnique({
                where: {
                  userId_postId: {
                    postId: id,
                    userId: payload.id,
                  },
                },
              });
              res.status(200).json({ ...post, isSaved: saved ? true : false });
            } catch (error) {
              console.log(error.message);
              res.status(500).json({ message: "Failed to get related data" });
            }
          } else {
            res.status(200).json({ ...post, isSaved: false });
          }
        });
      } else {
        res.status(200).json({ ...post, isSaved: false });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: "Failed to get post" });
    }
};






export const addPost = async (req, res) => {
    const body = req?.body;
    const tokenUserId = req.userId
    try {

        const newPost = await prisma.post.create({
            data : {
                ...body?.postData,
                userId : tokenUserId,
                postDetails : {
                    create : body?.postDetails

                }
            }
        })
        


        res.status(200).json(newPost)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: "Failed to add post"})
    }
};





export const updatePost = async (req, res) => {
  
    try {


        res.status(200).json({})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Failed to update post"})
    }
};






export const deletePost = async (req, res) => {
    const id = req.params.id
    const tokenUserId = req.userId

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: id
            }
        })

        if(post.userId !== tokenUserId){
            return res.status(403).json({message: "You are not authorized to delete this post"})
        }

        await prisma.post.delete({
            where: {
                id: id
            }
        })

        res.status(200).json({message: "Post deleted successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Failed to delete post"})
    }
};
