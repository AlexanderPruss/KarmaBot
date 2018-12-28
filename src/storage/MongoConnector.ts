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

    async updateKarma(request: KarmaRequest) : Promise<KarmaRequest> {
        await this.reconnect();

        let updateResult = await this.client.db().collection("karma").findOneAndUpdate(
            {name: `${request.karmaSubject}`},
            {
                $set: {name: `${request.karmaSubject}`},
                $inc: {karma: +request.requestedChange}
            },
            {upsert: true});

        //if the value is null, then the object was upserted.
        let updatedKarma = updateResult.value;
        if(updatedKarma == null) {
            return request;
        }
        return new KarmaRequest(updatedKarma.name, updatedKarma.karma);
    }

    async getLeaderboard(sort: number = -1) : Promise<KarmaRequest[]> {
        await this.reconnect();

        let leaderboard = await this.client.db().collection("karma").find()
            .sort({"karma": sort})
            .limit(5)
            .toArray();

        return leaderboard.map(
            (value => new KarmaRequest(value.name, value.karma)));
    }

    /**
     * Finds the karma of the given name, as well as its neighbors.
     */
    async getClosest(name : string) : Promise<KarmaRequest[]> {
        await this.reconnect();



        return null;
    }
}

export default new MongoConnector();
