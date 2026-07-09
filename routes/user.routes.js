import { usersTable, userSessions } from "../db/schema.js";
import db from "../db/index.js";
import express from "express";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { createHmac } from "crypto";
import jwt from "jsonwebtoken";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js"

const router = express.Router();

router.patch("/", ensureAuthenticated, async (req, res) => {
    const { name } = req.body;
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, user.id));

    return res.json({ status: "success" });
})

router.get('/', ensureAuthenticated, async (req, res) => {
    return res.json({ user });
}); // returns current logged in user


router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

    if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
    }

    const salt = randomBytes(16).toString("hex");

    const hashPassword = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    const [user] = await db
        .insert(usersTable)
        .values({
            name,
            email,
            password: hashPassword,
            salt
        })
        .returning({ id: usersTable.id });

    return res.status(201).json({
        status: "success",
        data: { userId: user.id }
    });
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const [existingUser] = await db
        .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            salt: usersTable.salt,
            role: usersTable.role,
            password: usersTable.password
        })
        .from(usersTable)
        .where((table) => eq(table.email, email));

    if (!existingUser) {
        return res.status(404).json({ error: `user with email ${email} does not exists!` });
    }

    const salt = existingUser.salt;
    const existingHash = existingUser.password

    const newHah = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if (newHah !== existingHash) {
        return res.status(400).json({ error: "Incorrect password!" })
    }

    const payload = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
    }

    const token = jwt.sign(payload, process.env.JWT_TOKEN)

    return res.cookie().json({ status: "success", token })
});


// router.post("/login", async (req, res) => { --> just for the practise
//     const { email, password } = req.body;

//     const [existingUser] = await db.select({
//         id: usersTable.id,
//         email: usersTable.email,
//         password: usersTable.password,
//         salt: usersTable.salt
//     }).from(usersTable).where(eq(usersTable.email, email));

//     if (!existingUser) {
//         return res.status(404).json({ error: `user with email ${email} does not exists!` });
//     }

//     const salt = existingUser.salt;
//     const userPassword = existingUser.password;

//     const newHash = createHmac("sha256", salt).update(password).digest("hex");

//     if (newHash !== userPassword) {
//         return res.status(404).json({ error: `Incorrect Password` });
//     }

//     //Create session

// })

export default router;