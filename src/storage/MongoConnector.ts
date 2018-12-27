import {MongoClient, Db, UpdateOneOptions} from "mongodb";
import mongoConfig,{MongoConfig} from "./MongoConfig";
import {KarmaRequest} from "../parsing/KarmaParser";


class MongoConnector {

    config: MongoConfig = mongoConfig;
    client : MongoClient;

    async reconnect(){
        let connected = true;
        if (this.client != null) {
            connected = await this.client.isConnected();
        }

        if (this.client == null || !connected) {
            this.client = await MongoClient.connect(this.config.connectionString.toString());
        }
    }

    async updateKarma(request : KarmaRequest) {
        await this.reconnect();
        this.client.db().collection("karma").updateOne(
            {name: `${request.karmaSubject}`},
            {
                $set: {name: `${request.karmaSubject}`},
                $inc: {karma: `${request.requestedChange}`}
            },
            {upsert : true});
    }

    async readKarma() {
        await this.reconnect();
    }
}

