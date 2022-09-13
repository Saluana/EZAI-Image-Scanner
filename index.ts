import express from "express"
import cors from "cors"
require("dotenv").config()
const port = process.env.PORT || 8081

const app = express()

app.use(cors({
    origin: "*",
}))
app.use(express.json())


import imageai from "./routes/imageai"
app.use("/", imageai);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})