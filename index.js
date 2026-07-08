import express from "express";
import userRoutes from "./routes/user.routes.js";
import db from "./db/index.js";
import { usersTable, userSessions } from "./db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken"

const app = express();
const port = process.env.port ?? 8000; // if you gave me port then i will run else i will run 8000.

app.use(express.json())
//middleware used to know current logged in user
app.use(async (req, res, next) => {
    try {
        const tokenHeader = req.headers["authorization"];
        if (!tokenHeader) {
            return next();
        }
        if (!tokenHeader.startsWith("Bearer")) {
            return res.status(400).json({ error: "authorization header must start with Bearer" })
        }

        const token = tokenHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);


        req.user = decoded;
        next();
    } catch {
        next();
    }
})

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running' })
})

app.use('/user', userRoutes)


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})