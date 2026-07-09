import express from "express";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.route.js";

import { authenticationMiddlewaare } from "./middlewares/auth.middleware.js"
const app = express();
const port = process.env.port ?? 8000; // if you gave me port then i will run else i will run 8000.

app.use(express.json())
//middleware used to know current logged in user
app.use(authenticationMiddlewaare);

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running' })
})

app.use('/user', userRoutes)
app.use('/admin', adminRoutes)

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})