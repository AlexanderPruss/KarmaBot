import {TestMongoDb} from "../storage/test-helpers/TestMongoDb.spec";
import {MongoConnector} from "../storage/MongoConnector";
import * as chai from 'chai';
import {expect} from 'chai';
import {OAuthService} from "./OAuthService";
import {TeamAuthToken} from "./TeamAuthToken";
import {defaultTeamAuthToken} from "./test-helpers/TeamAuthTokenProvider.spec";
import {AxiosPromise, AxiosRequestConfig} from "axios";
import * as chaiAsPromised from "chai-as-promised";

describe('OAuthService', function () {

    chai.use(chaiAsPromised);

    const testDb = new TestMongoDb();
    const mongoConnector = new MongoConnector();

    const testData: TeamAuthToken[] = [
        defaultTeamAuthToken("firstTeam"),
        defaultTeamAuthToken("dreamTeam"),
        defaultTeamAuthToken("goodImprovTeam")
    ];

    before(async () => {
        const mongoConfig = await testDb.start();
        mongoConnector.config = mongoConfig;

        for (const token of testData) {
            await testDb.saveDocument({...token}, "authtoken");
        }
    });

    after(async () => {
        await mongoConnector.closeConnection();
        await testDb.stop();
    });

    describe("#authorizeTeam", () => {
        it('authorizes and saves a new token for a team', async function () {
            const authService = new OAuthService();
            const token = defaultTeamAuthToken("newTeam");

            authService.mongoConnector = mongoConnector;
            authService.axios.post = (data, config) => {
                return Promise.resolve({
                    data: token,
                    status: 200,
                    statusText: "OK",
                    headers: null,
                    config: config
                }) as AxiosPromise;
            };

            await authService.authorizeTeam({code: "1234"});
            const resultingToken = await authService.getTeamToken("newTeam");
            token._id = resultingToken._id;

            expect(resultingToken).to.eql(token);
        });

        it('authorizes and overwrites existing tokens for a team', async function () {
            const authService = new OAuthService();
            const token = defaultTeamAuthToken("firstTeam");
            token.scope = "brand new scope";

            authService.mongoConnector = mongoConnector;
            authService.axios.post = (data, config) => {
                return Promise.resolve({
                    data: token,
                    status: 200,
                    statusText: "OK",
                    headers: null,
                    config: config
                }) as AxiosPromise;
            };

            await authService.authorizeTeam({code: "1234"});
            const resultingToken = await authService.getTeamToken("firstTeam");
            token._id = resultingToken._id;

            expect(resultingToken).to.eql(token);
        });

        it('throws an error if the slack oauth request fails', async function () {
            const authService = new OAuthService();
            const token = defaultTeamAuthToken("explodey team");

            authService.mongoConnector = mongoConnector;
            authService.axios.post = (data, config) => {
                throw new Error("Oh no!");
            };

            const authPromise =  authService.authorizeTeam({code: "1234"});
            await expect(authPromise).to.be.rejectedWith(Error);
        });
    });

    describe("#saveTeamToken", () => {
        it('ovewrites existing tokens for a team', async function () {
            const authService = new OAuthService();
            authService.mongoConnector = mongoConnector;
            const expectedToken = defaultTeamAuthToken("dreamTeam");
            expectedToken.access_token = "it's all completely changed wow";

            await authService.saveTeamToken(expectedToken);
            const token = await authService.getTeamToken("dreamTeam");
            expectedToken._id = token._id;

            expect(token).to.eql(expectedToken);
        });

        it('writes new tokens for teams that don\'t have any yet', async function () {
            const authService = new OAuthService();
            authService.mongoConnector = mongoConnector;
            const expectedToken = defaultTeamAuthToken("futureTeam");

            await authService.saveTeamToken(expectedToken);
            const token = await authService.getTeamToken("futureTeam");
            expectedToken._id = token._id;

            expect(token).to.eql(expectedToken);
        });
    });

    describe("#getTeamToken", () => {
        it('returns a team\'s token', async function () {
            const authService = new OAuthService();
            authService.mongoConnector = mongoConnector;
            const expectedToken = defaultTeamAuthToken("goodImprovTeam");

            const token = await authService.getTeamToken("goodImprovTeam");
            expectedToken._id = token._id;

            expect(token).to.eql(expectedToken);
        });

        it('returns null if the team doesn\'t have a token', async function () {
            const authService = new OAuthService();
            authService.mongoConnector = mongoConnector;

            const token = await authService.getTeamToken("nonexistent team");

            expect(token).to.be.null;
        });
    });

});

function mockOauthResponse(config: AxiosRequestConfig): AxiosPromise {
    return Promise.resolve({
        data: {data: "foo"},
        status: 200,
        statusText: "OK",
        headers: null,
        config: config
    });
}
