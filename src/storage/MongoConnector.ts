import {Db, MongoClient} from "mongodb";
import mongoConfig, {MongoConfig} from "./MongoConfig";
import logger from "../logging/Logger";

export class MongoConnector {

    config: MongoConfig = mongoConfig;
    client: MongoClient;

    async reconnectAndGetDb(): Promise<Db> {
        try {
            await this.reconnect();
        } catch (e) {
            logger.error("Failed to reconnect to mongoDb.");
            throw e;
        }
        return this.client.db();
    }

    async closeConnection() {
        logger.info("Closing connection.");
        if (this.client == null) {
            return;
        }
        return await this.client.close();
    }

    private async reconnect() {
        let connected = true;
        if (this.client != null) {
            connected = await this.client.isConnected();
        }

        if (this.client != null && connected) {
            return;
        }

        logger.info("Reconnecting to mongoDb.");
        this.client = await MongoClient.connect(
            this.config.connectionString,
            {useNewUrlParser: true});
    }


}

export default new MongoConnector();
