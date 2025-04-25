import { Request, Response } from "express"
import { isUserInGroup } from "../groups/groups.service";
import { getGroupBalances, createExpense, getExpenses, getMyExpenses, getMyBalances } from "./expenses.service";
import { GetExpensesInput } from "./expenses.types";

export const createExpenseController = async (req: Request, res: Response) => {
    try {
        const createdById = req.user?.userId;
        if (!createdById) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        if (req.body.groupId && !(await isUserInGroup(req.body.groupId, createdById))) {
            res.status(403).json({ error: "The user doesn't have permission to create an expense in the group." });
            return;
        }

        const expense = await createExpense(req.body, createdById);
        
        res.status(200).json({ message: "Expense created successfully.", expense });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const getExpensesController = async (req: Request, res: Response) => {
    try {
        const input: GetExpensesInput = {
            groupId: req.params.groupId,
            skip: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 10),
            take: parseInt(req.query.limit as string) || 10,
            sortField: req.query.sortField as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const createdById = req.user?.userId;
        if (!createdById) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        if (input.groupId && !(await isUserInGroup(input.groupId, createdById))) {
            res.status(403).json({ error: "The user doesn't have permission to see the expenses in the group." });
            return;
        }
    
        const { expenses, total } = await getExpenses(input);
    
        res.status(200).json({
            expenses,
            pagination: {
                total,
                page: Math.floor((input.skip || 0) / (input.take || 10)) + 1,
                limit: input.take || 10,
                totalPages: Math.ceil(total / (input.take || 10)),
            },
        });
      } catch (error: any) {
            res.status(500).json({ error: error.message });
      }
}

export const getGroupBalancesController = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const balances = await getGroupBalances(groupId);
        res.status(200).json(balances);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}


export const getMyExpensesController = async (req: Request, res: Response) => {  
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const expenses = await getMyExpenses(userId);
        res.status(200).json(expenses);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const getMyBalancesController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
    
        const groupId = req.params.groupId;
        const balances = await getMyBalances(userId, groupId);
    
        res.status(200).json(balances);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}