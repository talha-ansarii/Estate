import express from 'express';
import postRouter from "./routes/post.route.js"
import authRoute from "./routes/auth.route.js"
import testRoute from "./routes/test.route.js"
import userRoute from "./routes/user.route.js"
import chatRoute from "./routes/chat.route.js"
import messageRoute from "./routes/message.route.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import serverless from 'serverless-http';


const app = express();

// app.use(cors({
//     origin: process.env.CLIENT_URL,
//     credentials: false 
// }))
app.use(cookieParser())
app.use(express.json())

app.use("/api/post", postRouter)
app.use("/api/auth", authRoute)
app.use("/api/test", testRoute)
app.use("/api/user", userRoute)
app.use("/api/chats", chatRoute)
app.use("/api/messages", messageRoute)




app.listen(process.env.PORT || 8000, () => {
    console.log("Backend server is running!")
})

export const handler = serverless(app);