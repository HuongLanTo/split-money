import { PrismaClient } from '@prisma/client';
import { createGroup, getGroupsByUserId, getGroupById, isUserInGroup, addMemberToGroup, removeMemberFromGroup } from '../../../modules/groups/groups.service';

jest.mock('@prisma/client', () => {
    const mockCreate = jest.fn();
    const mockFindMany = jest.fn();
    const mockFindUnique = jest.fn();
    const mockFindFirst = jest.fn();
    const mockDelete = jest.fn();

    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            group: {
                create: mockCreate,
                findMany: mockFindMany,
                findUnique: mockFindUnique
            },
            groupMember: {
                findFirst: mockFindFirst,
                create: mockCreate,
                delete: mockDelete
            }
        })),
        // Export the mock functions so we can use them in tests
        __mockCreate: mockCreate,
        __mockFindMany: mockFindMany,
        __mockFindUnique: mockFindUnique,
        __mockFindFirst: mockFindFirst,
        __mockDelete: mockDelete
    };
});

// Get the mock functions from the mock module
const { 
    __mockCreate: mockCreate, 
    __mockFindMany: mockFindMany, 
    __mockFindUnique: mockFindUnique,
    __mockFindFirst: mockFindFirst,
    __mockDelete: mockDelete
} = require('@prisma/client');

describe('Groups Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createGroup', () => {
        it('should create a group with the creator as a member', async () => {
            const mockGroup = {
                id: '1',
                name: 'Test Group',
                members: [
                    { userId: 'creator-id', joinedAt: new Date() }
                ]
            };

            mockCreate.mockResolvedValue(mockGroup);

            const result = await createGroup({ name: 'Test Group' }, 'creator-id');

            expect(mockCreate).toHaveBeenCalledWith({
                data: {
                    name: 'Test Group',
                    members: {
                        create: {
                            userId: 'creator-id'
                        }
                    }
                },
                include: { members: true }
            });
            expect(result).toEqual(mockGroup);
        });
    });

    describe('getGroupsByUserId', () => {
        it('should get all groups for a user', async () => {
            const mockGroups = [
                {
                    id: '1',
                    name: 'Group 1',
                    members: [
                        {
                            joinedAt: new Date(),
                            User: {
                                id: 'user1',
                                name: 'User 1',
                                email: 'user1@test.com'
                            }
                        }
                    ]
                }
            ];

            mockFindMany.mockResolvedValue(mockGroups);

            const result = await getGroupsByUserId('user1');

            expect(mockFindMany).toHaveBeenCalledWith({
                where: {
                    members: {
                        some: {
                            userId: 'user1'
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
                        }
                    }
                }
            });
            expect(result).toEqual(mockGroups);
        });
    });

    describe('getGroupById', () => {
        it('should get a group by id', async () => {
            const mockGroup = {
                id: '1',
                name: 'Test Group',
                members: [
                    {
                        joinedAt: new Date(),
                        User: {
                            id: 'user1',
                            name: 'User 1',
                            email: 'user1@test.com'
                        }
                    }
                ]
            };

            mockFindUnique.mockResolvedValue(mockGroup);

            const result = await getGroupById('1');

            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { id: '1' },
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
            expect(result).toEqual(mockGroup);
        });
    });

    describe('isUserInGroup', () => {
        it('should return true if user is in group', async () => {
            mockFindFirst.mockResolvedValue({ groupId: '1', userId: 'user1' });

            const result = await isUserInGroup('1', 'user1');

            expect(mockFindFirst).toHaveBeenCalledWith({
                where: {
                    groupId: '1',
                    userId: 'user1'
                }
            });
            expect(result).toBe(true);
        });

        it('should return false if user is not in group', async () => {
            mockFindFirst.mockResolvedValue(null);

            const result = await isUserInGroup('1', 'user1');

            expect(result).toBe(false);
        });
    });

    describe('addMemberToGroup', () => {
        it('should add a member to a group', async () => {
            const mockMember = {
                groupId: '1',
                userId: 'user1',
                joinedAt: new Date()
            };

            mockCreate.mockResolvedValue(mockMember);

            const result = await addMemberToGroup('1', 'user1');

            expect(mockCreate).toHaveBeenCalledWith({
                data: {
                    groupId: '1',
                    userId: 'user1'
                }
            });
            expect(result).toEqual(mockMember);
        });
    });

    describe('removeMemberFromGroup', () => {
        it('should remove a member from a group', async () => {
            const mockMember = {
                groupId: '1',
                userId: 'user1'
            };

            mockDelete.mockResolvedValue(mockMember);

            const result = await removeMemberFromGroup('1', 'user1');

            expect(mockDelete).toHaveBeenCalledWith({
                where: {
                    userId_groupId: {
                        groupId: '1',
                        userId: 'user1'
                    }
                }
            });
            expect(result).toEqual(mockMember);
        });
    });
}); 