import {MongoClient} from "mongodb";
import mongoConfig, {MongoConfig} from "./MongoConfig";
import {Karma} from "../parsing/KarmaParser";
import {KarmaNeighbors} from "./KarmaNeighbors";


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

    async updateKarma(request: Karma) : Promise<Karma> {
        await this.reconnect();

        let updateResult = await this.client.db().collection("karma").findOneAndUpdate(
            {name: `${request.subject}`},
            {
                $set: {name: `${request.subject}`},
                $inc: {karma: +request.amount}
            },
            {upsert: true});

        //if the value is null, then the object was upserted.
        let updatedKarma = updateResult.value;
        if(updatedKarma == null) {
            return request;
        }
        return new Karma(updatedKarma.name, updatedKarma.karma);
    }

    async getLeaderboard(sort: number = -1) : Promise<Karma[]> {
        await this.reconnect();

        let leaderboard = await this.client.db().collection("karma").find()
            .sort({"karma": sort})
            .limit(5)
            .toArray();

        return leaderboard.map(
            (value => new Karma(value.name, value.karma)));
    }

    /**
     * Finds the karma of the given name, as well as its neighbors.
     */
    async getKarmaNeighbors(name : string) : Promise<KarmaNeighbors> {
        await this.reconnect();

        let target = await this.client.db().collection("karma").findOne(
            {name : name}
        );
        if (target == null) {
            return new KarmaNeighbors(null, null, null);
        }

        let targetKarma = new Karma(target.name, target.karma);

        let nextHighest = await this.client.db().collection("karma").aggregate([
            {
                $match: {karma: {$gt: targetKarma.amount}}
            },
            {
                $project: {
                    name: 1,
                    karma: 1,
                    difference: {
                        $subtract: [targetKarma.amount, "$karma"]
                    }
                }
            },
            {
                $sort: {difference: -1}
            },
            {
                $limit: 1
            }]
        ).toArray();
        let nextLowest = await this.client.db().collection("karma").aggregate([
            {
                $match: {karma: {$lt: targetKarma.amount}}
            },
            {
                $project: {
                    name: 1,
                    karma: 1,
                    difference: {
                        $subtract: [targetKarma.amount, "$karma"]
                    }
                }
            },
            {
                $sort: {difference: 1}
            },
            {
                $limit: 1
            }]
        ).toArray();

        let nextHighestKarma = nextHighest.length == 0 ?
            null : new Karma(nextHighest[0].name, nextHighest[0].karma);
        let nextLowestKarma = nextLowest.length == 0 ?
            null : new Karma(nextLowest[0].name, nextLowest[0].karma);

        return new KarmaNeighbors(targetKarma, nextLowestKarma, nextHighestKarma);
    } //TODO: Hmm. Do I want to somehow handle multiple names having the same karma?
    //TODO: ... how about just count how many other things with that same karma there are?


}

export default new MongoConnector();
