import { Request, Response } from "express";
import { addMemberToGroup, createGroup, getGroupById, getGroupsByUserId, isUserInGroup, removeMemberFromGroup } from "./groups.service";

export const createGroupController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized."});
            return;
        }

        const group = await createGroup(req.body, userId);

        res.status(201).json({
            message: "Group created successfully.",
            group
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message});
    }
}

export const getGroupsByUserIdController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }

        const groups = await getGroupsByUserId(userId);

        res.status(200).json(groups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const getGroupByIdController = async (req: Request, res: Response) => {
    try {
        const groupId = req.params.groupId;
        const group = await getGroupById(groupId);
        if (!group) {
            res.status(400).json({ error: "Group not found." });
        }

        res.status(200).json(group);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const addMemberToGroupController = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ error: "Missing userId in the body." });
            return;
        }
        
        const checkUserInGroup = await isUserInGroup(groupId, userId);
        
        if (checkUserInGroup) {
            res.status(400).json({ error: "The user already is in the group." });
            return;
        }

        const added = await addMemberToGroup(groupId, userId);
        res.status(200).json({ message: "Member added successfully.", added });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    } 
}

export const removeMemberFromGroupController = async (req: Request, res: Response) => {
    try {
        const { groupId, userId } = req.params;

        const checkUserInGroup = await isUserInGroup(groupId, userId);
        if (!checkUserInGroup) {
            res.status(400).json({ error: "The user isn't in the group." });
            return;
        }

        await removeMemberFromGroup(groupId, userId);
        res.status(200).json({ message: "Member removed successfully." });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
