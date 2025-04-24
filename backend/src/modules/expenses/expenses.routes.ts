import { Router } from "express"
import { authenticate } from "../../middleware/auth";
import { createExpenseController, getExpensesController, getGroupBalancesController, getMyBalancesController, getMyExpensesController } from "./expenses.controller";

const router = Router();

router.post("/", authenticate, createExpenseController);
router.get("/group/:groupId", authenticate, getExpensesController);
router.get("/group/:groupId/balances", authenticate, getGroupBalancesController);
router.get("/me", authenticate, getMyExpensesController);
router.get("/me/balances", authenticate, getMyBalancesController);

export default router;