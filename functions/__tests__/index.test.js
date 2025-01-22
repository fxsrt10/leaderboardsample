const admin = require('firebase-admin');
const axios = require('axios');

// Need to mock firbase, cors, and axios
jest.mock('firebase-admin', () => {
    const mockDoc = {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue({
            exists: true,
            id: 'testStageId',
            data: () => ({
                stageName: 'Test Stage',
                threshold_number: 100
            }),
            get: (field) => ({
                stageName: 'Test Stage',
                threshold_number: 100
            })[field]
        }),
        collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({
                docs: [{
                    data: () => ({
                        displayName: 'Player 1',
                        hitFactor: 5.5,
                        rank: 1,
                        timeInSeconds: 10
                    })
                }]
            })
        })
    };

    const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc)
    };

    return {
        initializeApp: jest.fn(),
        firestore: jest.fn(() => ({
            collection: jest.fn().mockReturnValue(mockCollection),
            batch: () => ({
                set: jest.fn().mockReturnThis(),
                commit: jest.fn().mockResolvedValue(true)
            })
        }))
    };
});


jest.mock('axios');

jest.mock('cors', () => {
    return () => {
        return (req, res, next) => next();
    };
});

const functions = require('../index');

// Setup fetchLeaderboard test
describe('fetchLeaderboard', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            method: 'GET',
            headers: {
                'origin': 'http://localhost:3000'
            },
            get: jest.fn((header) => req.headers[header])
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if no stageId is provided', async () => {
        await functions.fetchLeaderboard(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('Should successfully fetch and save leaderboard data', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    response: {
                        scores_list_custom_score: ['score1'],
                        stagename_text: 'Test Stage',
                        threshold_number: 100
                    }
                }
            })
            .mockResolvedValueOnce({
                data: {
                    response: {
                        results: [{
                            _id: 'score1',
                            displayname_text: 'Player 1',
                            hitfactor_number: 5.5,
                            acerank_option_rank: 1,
                            timeinseconds_number: 10
                        }]
                    }
                }
            });

        req.query.stageId = 'testStageId';

        await functions.fetchLeaderboard(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Leaderboard data fetched and saved.',
            stageId: 'testStageId',
            totalScores: 1
        });
    }, 10000); // Increased timeout

    it('should handle API errors gracefully', async () => {
        req.query.stageId = 'testStageId';
        axios.get.mockRejectedValue(new Error('API Error'));

        await functions.fetchLeaderboard(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// Setup getLeaderboard test
describe('getLeaderboard', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            method: 'GET',
            headers: {
                'origin': 'http://localhost:3000'
            },
            get: jest.fn((header) => req.headers[header])
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if missing stageId', async () => {
        await functions.getLeaderboard(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return leaderboard json data successfully', async () => {
        req.query.stageId = 'testStageId';
        await functions.getLeaderboard(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            stageId: 'testStageId',
            stageName: 'Test Stage',
            threshold: 100,
            scores: [{
                displayName: 'Player 1',
                hitFactor: 5.5,
                rank: 1,
                timeInSeconds: 10
            }]
        });
    });
});