import {TestMongoDb} from "../storage/test-helpers/TestMongoDb.spec";
import {MongoConnector} from "../storage/MongoConnector";
import {LeaderboardService} from "./LeaderboardService";
import {Karma} from "../karma/Karma";
import {expect} from 'chai';

describe('LeaderboardService', function () {

    const leaderboardService = new LeaderboardService();
    const testDb = new TestMongoDb();
    const mongoConnector = new MongoConnector();
    leaderboardService.mongoConnector = mongoConnector;

    const testData: Karma[] = [
        {name: "foo", value: -1000},
        {name: "bar", value: -900},
        {name: "baz", value: -800},
        {name: "stuff", value: 0},
        {name: "hotdogs", value: 2},
        {name: "karmabot", value: 9},
        {name: "parrots", value: 800},
        {name: "cats", value: 900},
        {name: "dogs", value: 1000}
    ];

    before(async () => {
        const mongoConfig = await testDb.start();
        mongoConnector.config = mongoConfig;

        for (const karma of testData) {
            await testDb.saveDocument({...karma}, "karma");
        }
    });

    after(async () => {
        await mongoConnector.closeConnection();
        await testDb.stop();
    });

    describe("#getLeaderboard", () => {

        it('returns the top five karma entries ', async function () {
            const expectedLeaderboard: Karma[] = [
                {name: "dogs", value: 1000},
                {name: "cats", value: 900},
                {name: "parrots", value: 800},
                {name: "karmabot", value: 9},
                {name: "hotdogs", value: 2}
            ];

            const leaderboard = await leaderboardService.getLeaderboard();

            expect(leaderboard).to.eql(expectedLeaderboard);
        });

        it('returns the bottom five karma entries if given the proper sort parameter', async function () {
            const expectedLeaderboard: Karma[] = [
                {name: "foo", value: -1000},
                {name: "bar", value: -900},
                {name: "baz", value: -800},
                {name: "stuff", value: 0},
                {name: "hotdogs", value: 2}
            ];

            const leaderboard = await leaderboardService.getLeaderboard(1);

            expect(leaderboard).to.eql(expectedLeaderboard);
        });

    });

});