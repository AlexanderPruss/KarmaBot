import {MongoConfig} from "../MongoConfig";
import * as mongoUnit from "mongo-unit";
import logger from "../../logging/Logger";

/**
 * Provides an in-memory MongoDB that integration tests can run against.
 */
export class TestMongoDb {

    running = false;
    mongoConfig: MongoConfig;

    /**
     * Starts an in-memory MongoDB and returns the MongoConfig used to connect to it.
     */
    async start(): Promise<MongoConfig> {
        if (this.running) {
            throw new Error("Test Mongo Db is already running.");
        }

        let connectionUrl = await mongoUnit.start();
        this.mongoConfig = {
            connectionString: connectionUrl
        };

        logger.info("Creating test database: " + connectionUrl);
        return this.mongoConfig;
    }

    /**
     * Helper method for setting up tests. Accepts a document, converts it to JSON, and saves it
     * in the indicated collection.
     * @param document
     * @param collection
     */
    async saveDocument(document: object, collection: string) {
        await mongoUnit.load({
            [collection]: {...document}
        });
    }

    /**
     * This currently (v.1.4.4) doesn't stop the DB if there's a connection still open to it.
     * A fix has been pushed to master and will be deployed soon -
     * https://github.com/mikhail-angelov/mongo-unit/pull/19
     */
    async stop() {
        await mongoUnit.stop();
        this.running = false;
    }
}