import { Router, Request, Response } from "express";
import { register, login } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { RegisterSchema, LoginSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(RegisterSchema), async (req: Request, res: Response) => {
    await register(req, res);
});

router.post("/login", validate(LoginSchema), async (req: Request, res: Response) => {
    await login(req, res);
});

export default router;