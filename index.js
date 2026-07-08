import express from "express";
import userRoutes from "./routes/user.routes.js";
import db from "./db/index.js";
import { usersTable, userSessions } from "./db/schema.js";
import { eq } from "drizzle-orm";

const app = express();
const port = process.env.port ?? 8000; // if you gave me port then i will run else i will run 8000.

app.use(express.json())
//middleware used to know current logged in user
app.use(async (req, res, next) => {
    const sessionID = req.headers["session-id"];
    if (!sessionID) {
        return next();
    }

    const [data] = await db
    .select({
        sessionID: userSessions.id,
        userId: userSessions.userID,
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email
    })
    .from(userSessions)
    .innerJoin(usersTable, eq(usersTable.id, userSessions.userID))
    .where(eq(userSessions.id, sessionID));

    if (!data) {
        return next();
    }
    req.user = data;
    next();
})

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running' })
})

app.use('/user', userRoutes)


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})