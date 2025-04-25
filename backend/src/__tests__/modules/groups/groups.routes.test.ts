import request from 'supertest';
import express from 'express';
import groupsRoutes from '../../../modules/groups/groups.routes';
import { 
    createGroupController, 
    getGroupsByUserIdController,
    getGroupByIdController,
    addMemberToGroupController,
    removeMemberFromGroupController
} from '../../../modules/groups/groups.controller';

// Mock the controller functions
jest.mock('../../../modules/groups/groups.controller', () => ({
    createGroupController: jest.fn(),
    getGroupsByUserIdController: jest.fn(),
    getGroupByIdController: jest.fn(),
    addMemberToGroupController: jest.fn(),
    removeMemberFromGroupController: jest.fn()
}));

// Mock the authentication middleware
jest.mock('../../../middleware/auth', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { userId: 'test-user-id' };
        next();
    }
}));

describe('Groups Routes', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/groups', groupsRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/groups', () => {
        it('should call createGroupController', async () => {
            const mockGroup = {
                id: '1',
                name: 'Test Group',
                members: [{ userId: '1' }]
            };

            (createGroupController as jest.Mock).mockImplementation((req, res) => {
                res.status(201).json({
                    message: 'Group created successfully.',
                    group: mockGroup
                });
            });

            const response = await request(app)
                .post('/api/groups')
                .send({
                    name: 'Test Group'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                message: 'Group created successfully.',
                group: mockGroup
            });
            expect(createGroupController).toHaveBeenCalled();
        });
    });

    describe('GET /api/groups', () => {
        it('should call getGroupsByUserIdController', async () => {
            const mockGroups = [
                {
                    id: '1',
                    name: 'Group 1',
                    members: [{ userId: '1' }]
                },
                {
                    id: '2',
                    name: 'Group 2',
                    members: [{ userId: '1' }]
                }
            ];

            (getGroupsByUserIdController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockGroups);
            });

            const response = await request(app)
                .get('/api/groups');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockGroups);
            expect(getGroupsByUserIdController).toHaveBeenCalled();
        });
    });

    describe('GET /api/groups/:groupId', () => {
        it('should call getGroupByIdController', async () => {
            const mockGroup = {
                id: '1',
                name: 'Test Group',
                members: [{ userId: '1' }]
            };

            (getGroupByIdController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockGroup);
            });

            const response = await request(app)
                .get('/api/groups/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockGroup);
            expect(getGroupByIdController).toHaveBeenCalled();
        });
    });

    describe('POST /api/groups/:groupId/member', () => {
        it('should call addMemberToGroupController', async () => {
            const mockMember = {
                groupId: '1',
                userId: '2'
            };

            (addMemberToGroupController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({
                    message: 'Member added successfully.',
                    added: mockMember
                });
            });

            const response = await request(app)
                .post('/api/groups/1/member')
                .send({
                    userId: '2'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Member added successfully.',
                added: mockMember
            });
            expect(addMemberToGroupController).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/groups/:groupId/member/:userId', () => {
        it('should call removeMemberFromGroupController', async () => {
            (removeMemberFromGroupController as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({
                    message: 'Member removed successfully.'
                });
            });

            const response = await request(app)
                .delete('/api/groups/1/member/2');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Member removed successfully.'
            });
            expect(removeMemberFromGroupController).toHaveBeenCalled();
        });
    });
}); 