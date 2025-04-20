import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { RegisterInput, LoginInput } from "./auth.types";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export const registerUser = async (input: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: input.email}
    });
    if (existingUser) {
        throw new Error("Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
        }
    });

    return user;
}

export const loginUser = async (input: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email: input.email }
    });
    if (!user) {
        throw new Error("The email is not registered.");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new Error("The password is incorrect.");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d"});
    
    return { token, user};
}