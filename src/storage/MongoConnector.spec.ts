import {MongoConnector} from "./MongoConnector";
import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiAsPromised from "chai-as-promised";
import {MongoError} from "mongodb";
import {TestMongoDb} from "./test-helpers/TestMongoDb.spec";

chai.use(chaiAsPromised);

describe("MongoConnector", () => {
    const testDb = new TestMongoDb();
    const mongoConnector = new MongoConnector();

    before(async () => {
        const mongoConfig = await testDb.start();
        await testDb.saveDocument({foo: "bar"}, "MongoConnectorTest");
        mongoConnector.config = mongoConfig;
    });

    after(async () => {
        await mongoConnector.closeConnection();
        await testDb.stop();
    });

    describe("#reconnectAndGetDb", () => {
        it("should connect to mongoDB", async () => {
            const db = await mongoConnector.reconnectAndGetDb();

            //Check connection by seeing that db methods are working.
            const collections = await db.listCollections().toArray();

            expect(collections).to.have.lengthOf(1);
        });

        it("should attempt to reconnect if the connection breaks", async () => {
            await mongoConnector.reconnectAndGetDb();
            await mongoConnector.closeConnection();
            const db = await mongoConnector.reconnectAndGetDb();

            //Check connection by seeing that db methods are working.
            const collections = await db.listCollections().toArray();

            expect(collections).to.have.lengthOf(1);
        });

        it("shouldn't reconnect if the connection still works", async () => {
            const db = await mongoConnector.reconnectAndGetDb();
            const dbReconnected = await mongoConnector.reconnectAndGetDb();

            expect(db == dbReconnected);
        });

        it("throws an exception if it can't reconnect", async () => {
            const mongoConnector = new MongoConnector();
            mongoConnector.config = {connectionString: "foo bar fake lol"};

            const dbPromise = mongoConnector.reconnectAndGetDb();

            await expect(dbPromise).to.be.rejectedWith(MongoError);
        });
    });

    describe("#closeConnection", () => {
        it("Closes the DB connection.", async () => {
            const db = await mongoConnector.reconnectAndGetDb();
            await mongoConnector.closeConnection();

            const collectionsPromise = db.listCollections().toArray();

            await expect(collectionsPromise).to.be.rejectedWith(MongoError);
        });

        it("Does nothing if the connection is already closed.", async () => {
            //No errors are thrown.
            await mongoConnector.closeConnection();
            await mongoConnector.closeConnection();
        });

    });
});