import {TestMongoDb} from "../storage/test-helpers/TestMongoDb.spec";
import {MongoConnector} from "../storage/MongoConnector";
import {Karma} from "./Karma";
import {KarmaService} from "./KarmaService";
import {expect} from 'chai';
import {KarmaUpdateHandler} from "./KarmaUpdateHandler";
import {EventService} from "../events/EventService";
import {TeamAuthToken} from "../oauth/TeamAuthToken";

describe('KarmaUpdateHandler', function () {

    const handler = new KarmaUpdateHandler();

    const karmaService = new KarmaService();
    const eventService = new EventService();

    const testDb = new TestMongoDb();
    const mongoConnector = new MongoConnector();
    karmaService.mongoConnector = mongoConnector;
    handler.karmaService = karmaService;
    handler.eventService = eventService;

    const testData: Karma[] = [
        {name: "Stuff", value: 0},
        {name: "Hotdogs", value: 2},
        {name: "Karmabot", value: 9}
    ];

    before(async () => {
        const mongoConfig = await testDb.start();
        mongoConnector.config = mongoConfig;

        for (const karma of testData) {
            await testDb.saveDocument({...karma}, "karmaTeamOne");
        }
    });

    after(async () => {
        await mongoConnector.closeConnection();
        await testDb.stop();
    });

    describe("#handleEvent", () => {
        it('should parse the message, find karma requests, and execute updates', async function () {
            let resultingMessage: string = null;
            let resultingChannel: string = null;
            let resultingToken: string = null;
            eventService.respondWithMessage = async (message, channel, token) => {
                resultingChannel = channel;
                resultingMessage = message;
                resultingToken = token.bot_access_token;
            };

            const token = new TeamAuthToken();
            token.team_id = "TeamOne";
            token.bot = {
              bot_access_token : "BotAccess",
              bot_user_id: "karmabot"
            };
            await handler.handleEvent({
                channel: "TV 1234",
                text: "stuff++ dumbthings-- hotdogs foo"
            },
                token
            );
            const stuffKarma = await karmaService.findKarma("Stuff", "TeamOne");
            const hotdogsKarma = await karmaService.findKarma("Hotdogs", "TeamOne");
            const karmabotKarma = await karmaService.findKarma("Karmabot", "TeamOne");
            const fooKarma = await karmaService.findKarma("Foo", "TeamOne");
            const dumbthingsKarma = await karmaService.findKarma("Dumbthings", "TeamOne");

           expect(resultingMessage).to.eql(
                `Stuff now has 1 karma. Hotdogs has the next highest karma, with 2 karma. Dumbthings has the next lowest karma, with -1 karma.
-----
Dumbthings now has -1 karma. Stuff has the next highest karma, with 1 karma.`);
            expect(resultingChannel).to.eql("TV 1234");
            expect(resultingToken).to.eql("BotAccess");
            expect(stuffKarma.value).to.eql(1);
            expect(hotdogsKarma.value).to.eql(2);
            expect(karmabotKarma.value).to.eql(9);
            expect(fooKarma).to.be.null;
            expect(dumbthingsKarma.value).to.eql(-1);
        });
    });

});