import { Request, Response } from 'express';
import { 
    createGroupController, 
    getGroupsByUserIdController, 
    getGroupByIdController,
    addMemberToGroupController,
    removeMemberFromGroupController
} from '../../../modules/groups/groups.controller';
import { 
    createGroup, 
    getGroupsByUserId, 
    getGroupById, 
    isUserInGroup, 
    addMemberToGroup, 
    removeMemberFromGroup 
} from '../../../modules/groups/groups.service';

// Mock the service layer
jest.mock('../../../modules/groups/groups.service');

describe('Groups Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        mockResponse = {
            json: mockJson,
            status: mockStatus
        };
        mockRequest = {
            user: { userId: 'test-user-id' },
            body: {},
            params: {}
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createGroupController', () => {
        it('should create a group successfully', async () => {
            const mockGroup = {
                id: '1',
                name: 'Test Group',
                members: [{ userId: 'test-user-id' }]
            };

            (createGroup as jest.Mock).mockResolvedValue(mockGroup);
            mockRequest.body = { name: 'Test Group' };

            await createGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Group created successfully.',
                group: mockGroup
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await createGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized.' });
        });

        it('should handle errors and return 500', async () => {
            (createGroup as jest.Mock).mockRejectedValue(new Error('Database error'));
            mockRequest.body = { name: 'Test Group' };

            await createGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('getGroupsByUserIdController', () => {
        it('should get groups for authenticated user', async () => {
            const mockGroups = [
                { id: '1', name: 'Group 1' },
                { id: '2', name: 'Group 2' }
            ];

            (getGroupsByUserId as jest.Mock).mockResolvedValue(mockGroups);

            await getGroupsByUserIdController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockGroups);
        });

        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;

            await getGroupsByUserIdController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized.' });
        });

        it('should handle errors and return 500', async () => {
            (getGroupsByUserId as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getGroupsByUserIdController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('getGroupByIdController', () => {
        it('should get group by id', async () => {
            const mockGroup = {
                id: '1',
                name: 'Test Group'
            };

            (getGroupById as jest.Mock).mockResolvedValue(mockGroup);
            mockRequest.params = { groupId: '1' };

            await getGroupByIdController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockGroup);
        });

        it('should return 400 if group not found', async () => {
            (getGroupById as jest.Mock).mockResolvedValue(null);
            mockRequest.params = { groupId: '1' };

            await getGroupByIdController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Group not found.' });
        });

        it('should handle errors and return 500', async () => {
            (getGroupById as jest.Mock).mockRejectedValue(new Error('Database error'));
            mockRequest.params = { groupId: '1' };

            await getGroupByIdController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('addMemberToGroupController', () => {
        it('should add member to group successfully', async () => {
            const mockMember = {
                groupId: '1',
                userId: 'new-user-id'
            };

            (isUserInGroup as jest.Mock).mockResolvedValue(false);
            (addMemberToGroup as jest.Mock).mockResolvedValue(mockMember);
            mockRequest.params = { groupId: '1' };
            mockRequest.body = { userId: 'new-user-id' };

            await addMemberToGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Member added successfully.',
                added: mockMember
            });
        });

        it('should return 400 if user already in group', async () => {
            (isUserInGroup as jest.Mock).mockResolvedValue(true);
            mockRequest.params = { groupId: '1' };
            mockRequest.body = { userId: 'existing-user-id' };

            await addMemberToGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'The user already is in the group.' });
        });

        it('should return 400 if userId is missing', async () => {
            mockRequest.params = { groupId: '1' };
            mockRequest.body = {};

            await addMemberToGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Missing userId in the body.' });
        });

        it('should handle errors and return 500', async () => {
            (isUserInGroup as jest.Mock).mockRejectedValue(new Error('Database error'));
            mockRequest.params = { groupId: '1' };
            mockRequest.body = { userId: 'new-user-id' };

            await addMemberToGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('removeMemberFromGroupController', () => {
        it('should remove member from group successfully', async () => {
            (isUserInGroup as jest.Mock).mockResolvedValue(true);
            (removeMemberFromGroup as jest.Mock).mockResolvedValue(true);
            mockRequest.params = { groupId: '1', userId: 'user-to-remove' };

            await removeMemberFromGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Member removed successfully.'
            });
        });

        it('should return 400 if user not in group', async () => {
            (isUserInGroup as jest.Mock).mockResolvedValue(false);
            mockRequest.params = { groupId: '1', userId: 'non-member' };

            await removeMemberFromGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: "The user isn't in the group." });
        });

        it('should handle errors and return 500', async () => {
            (isUserInGroup as jest.Mock).mockRejectedValue(new Error('Database error'));
            mockRequest.params = { groupId: '1', userId: 'user-to-remove' };

            await removeMemberFromGroupController(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
}); 