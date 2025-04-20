import { registerUser, loginUser } from "./auth.service";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error: any) {
        res.status(400).json({
            error: error.message,
        });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { token, user } = await loginUser(req.body);
        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        })
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
}