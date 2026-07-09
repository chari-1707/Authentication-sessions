import express from "express";
import db from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { log } from "node:console";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js"

const router = express.Router();

router.get("/users", ensureAuthenticated, async (req, res) => {
    const [users] = await db.select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email
    }).from(usersTable);
    log(users)
    return res.json(users);
})

export default router;