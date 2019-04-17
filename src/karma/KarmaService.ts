import {Karma} from "./Karma";
import {KarmaNeighbors} from "./KarmaNeighbors";
import mongoConnector, {MongoConnector} from "../storage/MongoConnector";

export class KarmaService {
    private mongoConnector: MongoConnector = mongoConnector;

    async updateKarma(request: Karma): Promise<Karma> {
        const db = await this.mongoConnector.reconnectAndGetDb();

        let updateResult = await db.collection("karma").findOneAndUpdate(
            {name: `${request.subject}`},
            {
                $set: {name: `${request.subject}`},
                $inc: {karma: +request.amount}
            },
            {upsert: true});

        //if the value is null, then the object was upserted.
        let updatedKarma = updateResult.value;
        if (updatedKarma == null) {
            return request;
        }
        return new Karma(updatedKarma.name, updatedKarma.karma);
    }

    async getLeaderboard(sort: number = -1): Promise<Karma[]> {
        const db = await this.mongoConnector.reconnectAndGetDb();

        let leaderboard = await db.collection("karma").find()
            .sort({"karma": sort})
            .limit(5)
            .toArray();

        return leaderboard.map(
            (value => new Karma(value.name, value.karma)));
    }

    /**
     * Finds the karma of the given name, as well as its neighbors.
     */
    async getKarmaNeighbors(name: string): Promise<KarmaNeighbors> {
        const db = await this.mongoConnector.reconnectAndGetDb();
        let target = await db.collection("karma").findOne(
            {name: name}
        );
        if (target == null) {
            return new KarmaNeighbors(null, null, null);
        }

        let targetKarma = new Karma(target.name, target.karma);

        let nextHighest = await db.collection("karma").aggregate([
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
        let nextLowest = await db.collection("karma").aggregate([
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
    }
    //TODO: Hmm. Do I want to somehow handle multiple names having the same karma?
    //TODO: ... how about just count how many other things with that same karma there are?
}

export default new KarmaService();