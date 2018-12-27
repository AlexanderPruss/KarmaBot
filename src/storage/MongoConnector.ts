import {MongoClient} from "mongodb";
import mongoConfig, {MongoConfig} from "./MongoConfig";
import {KarmaRequest} from "../parsing/KarmaParser";


class MongoConnector {

    config: MongoConfig = mongoConfig;
    client: MongoClient;

    async reconnect() {
        let connected = true;
        if (this.client != null) {
            connected = await this.client.isConnected();
        }

        if (this.client == null || !connected) {
            console.log("Reconnecting to mongoDb.");
            this.client = await MongoClient.connect(
                this.config.connectionString.toString(),
                {useNewUrlParser: true});
        }
    }

    async updateKarma(request: KarmaRequest) {
        await this.reconnect();

        this.client.db().collection("karma").updateOne(
            {name: `${request.karmaSubject}`},
            {
                $set: {name: `${request.karmaSubject}`},
                $inc: {karma: +request.requestedChange}
            },
            {upsert: true});
    }

    async readKarma() {
        await this.reconnect();

        let topEntries = await this.client.db().collection("karma").find()
            .sort({"karma": -1})
            .limit(5)
            .toArray();
        console.log(topEntries);
        return topEntries;
    }
}

export default new MongoConnector();
