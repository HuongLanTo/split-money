import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Invalid token."});
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized."});
    }
}