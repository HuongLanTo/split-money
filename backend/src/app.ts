import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes";
import groupsRoutes from "./modules/groups/groups.routes";
import expensesRoutes from "./modules/expenses/expenses.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/expenses", expensesRoutes);

// Error route for testing
app.get("/error", (req, res, next) => {
    next(new Error("Test error"));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "Route not found"
    });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong"
    });
});

export default app;
