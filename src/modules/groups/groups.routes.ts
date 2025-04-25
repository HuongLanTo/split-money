import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { addMemberToGroupController, createGroupController, getGroupByIdController, getGroupsByUserIdController, removeMemberFromGroupController } from "./groups.controller";

const router = Router();

router.post("/", authenticate, createGroupController);
router.post("/:groupId/member", authenticate, addMemberToGroupController);

router.get("/", authenticate, getGroupsByUserIdController)
router.get("/:groupId", authenticate, getGroupByIdController)

router.delete("/:groupId/member/:userId", authenticate, removeMemberFromGroupController);

export default router;