import jwt from "jsonwebtoken"

export const authenticationMiddlewaare = async function (req, res, next) {
    try {
        const tokenHeader = req.headers["authorization"];
        if (!tokenHeader) {
            return next();
        }
        if (!tokenHeader.startsWith("Bearer")) {
            return res.status(400).json({ error: "authorization header must start with Bearer" })
        }

        const token = tokenHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_TOKEN); // if correct then user info is copied to decoded 

        req.user = decoded;
        next();
    } catch {
        next();
    }
}

export const ensureAuthenticated = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "You are not logged in" });
    }
    next();
}

export const restrictToRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(401).json({
                error: "You are not authorized to access this resource"
            })
        }
    }
} // this is a closure function so yeah