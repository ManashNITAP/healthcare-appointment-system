import express from "express"
import { createServer } from "http"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import chatRouter from "./routes/chatRoute.js"
import aiRouter from "./routes/aiRoute.js"
import { initializeSocket } from "./sockets/socketServer.js"

// app config
const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 5500
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/chat", chatRouter)
app.use("/api/ai", aiRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

// Initialize Socket.IO
initializeSocket(httpServer);

httpServer.listen(port, () => console.log(`Server started on PORT:${port}`))