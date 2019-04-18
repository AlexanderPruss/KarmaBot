import {TestMongoDb} from "../storage/test-helpers/TestMongoDb.spec";
import {MongoConnector} from "../storage/MongoConnector";
import {Karma} from "./Karma";
import {KarmaService} from "./KarmaService";
import {expect} from 'chai';
import {KarmaNeighbors} from "./KarmaNeighbors";

describe('KarmaService', function () {

    const karmaService = new KarmaService();
    const testDb = new TestMongoDb();
    const mongoConnector = new MongoConnector();
    karmaService.mongoConnector = mongoConnector;

    const testData : Karma[] = [
        {name : "foo", value: -1000},
        {name : "bar", value: -900},
        {name : "baz", value: -800},
        {name : "stuff", value: 0},
        {name : "hotdogs", value: 2},
        {name : "karmabot", value: 9},
        {name : "parrots", value: 800},
        {name : "cats", value: 900},
        {name : "dogs", value: 1000}
    ];

    before(async () => {
        const mongoConfig = await testDb.start();
        mongoConnector.config = mongoConfig;

        for(const karma of testData) {
            await testDb.saveDocument({...karma}, "karma");
        }
    });

    after(async () => {
        await mongoConnector.closeConnection();
        await testDb.stop();
    });

    describe("#findKarma", () => {

        it('finds a karma by name', async function () {
            const expectedKarma :Karma = {name: "karmabot", value: 9};

            const karma = await karmaService.findKarma("karmabot");

            expect(karma).to.eql(expectedKarma);
        });

        it('returns null if a karma can\'t be found', async function () {
            const karma = await karmaService.findKarma("some other dumb bot");

            expect(karma).to.be.null;
        });

    });

    describe("#updateKarma", () => {

        it('updates the value of an existing karma', async function () {
            const expectedKarma : Karma = {name: "stuff", value: 1};

            const karma = await karmaService.updateKarma(expectedKarma);

            expect(karma).to.eql(expectedKarma);
        });

        it('upserts non-existing karmas', async function () {
            const expectedKarma : Karma = {name: "nonexisting stuff", value: 1};

            const karma = await karmaService.updateKarma(expectedKarma);

            expect(karma).to.eql(expectedKarma);
        });

    });

    describe("#getKarmaNeighbors", () => {

        it('finds the given karma, as well as its next-closest neighbors by value', async function () {
            const expectedNeighbors : KarmaNeighbors = {
                karma: {name: "cats", value: 900},
                previousKarma: {name: "parrots", value: 800},
                nextKarma: {name: "dogs", value: 1000}
            };

            const karmaNeighbors = await karmaService.getKarmaNeighbors("cats");

            expect(karmaNeighbors).to.eql(expectedNeighbors);
        });

        it('has a null next-karma if the target karma is already the highest valued', async function () {
            const expectedNeighbors : KarmaNeighbors = {
                previousKarma: {name: "cats", value: 900},
                nextKarma: null,
                karma: {name: "dogs", value: 1000}
            };

            const karmaNeighbors = await karmaService.getKarmaNeighbors("dogs");

            expect(karmaNeighbors).to.eql(expectedNeighbors);
        });

        it('has a null previous-karma if the target karma is already the lowest valued', async function () {
            const expectedNeighbors : KarmaNeighbors = {
                karma: {name: "foo", value: -1000},
                previousKarma: null,
                nextKarma: {name: "bar", value: -900}
            };

            const karmaNeighbors = await karmaService.getKarmaNeighbors("foo");

            expect(karmaNeighbors).to.eql(expectedNeighbors);
        });

        it('returns an empty KarmaNeighbors if no such karma exists', async function () {
            const expectedNeighbors : KarmaNeighbors = {
                karma: null,
                previousKarma: null,
                nextKarma: null
            };

            const karmaNeighbors = await karmaService.getKarmaNeighbors("invisible cats");

            expect(karmaNeighbors).to.eql(expectedNeighbors);
        });
    });

});