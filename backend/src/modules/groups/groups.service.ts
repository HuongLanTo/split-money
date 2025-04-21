import { PrismaClient } from "@prisma/client";
import { CreateGroupInput } from "./groups.types";

const prisma = new PrismaClient();

export const createGroup = async (input: CreateGroupInput, creatorId: string) => {
    const group = await prisma.group.create({
        data: {
            name: input.name,
            members: {
                create: {
                    userId: creatorId
                }
            }
        },
        include: {
            members: true  // Include members in the response
        }
    });

    return group;
}

export const getGroupsByUserId = async (userId: string) => {
    return await prisma.group.findMany({
        where: {
            members: {
                some: { // Check if the user is a member of the group
                    userId: userId
                }
            }
        },
        include: {
            members: {
                select: {
                    joinedAt: true,
                    User: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
            }
        }
    });
}

export const getGroupById = async (groupId: string) => {
    return await prisma.group.findUnique({
        where: {
            id: groupId
        },
        include: {
            members: {
                select: {
                    joinedAt: true,
                    User: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    });
}

export const isUserInGroup = async (groupId: string, userId: string) => {
    const membership = await prisma.groupMember.findFirst({
        where: {
            groupId,
            userId
        }
    });

    return !!membership;
}

export const addMemberToGroup = async (groupId: string, userId: string) => {
    return await prisma.groupMember.create({
        data: {
            groupId,
            userId
        }
    });
}

export const removeMemberFromGroup = async (groupId: string, userId: string) => {
    return await prisma.groupMember.delete({
        where: {
            userId_groupId: {
                groupId,
                userId
            }
        }
    });
}



