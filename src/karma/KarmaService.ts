import {Karma} from "./Karma";
import {KarmaNeighbors} from "./KarmaNeighbors";
import mongoConnector, {MongoConnector} from "../storage/MongoConnector";

/**
 * KarmaService is in charge of database operations for Karma.
 */
export class KarmaService {

    private mongoConnector: MongoConnector = mongoConnector;

    async updateKarma(karma: Karma): Promise<Karma> {
        const db = await this.mongoConnector.reconnectAndGetDb();

        let updateResult = await db.collection("karma").findOneAndUpdate(
            {name: `${karma.name}`},
            {
                $set: {name: `${karma.name}`},
                $inc: {value: +karma.value}
            },
            {upsert: true});

        //if the value is null, then the object was upserted.
        let updatedKarma = updateResult.value;
        return updatedKarma == null ? karma : updatedKarma;
    }

    async getLeaderboard(sort: number = -1): Promise<Karma[]> {
        const db = await this.mongoConnector.reconnectAndGetDb();

        let leaderboard = await db.collection("karma").find()
            .sort({value: sort})
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

        let targetKarma = new Karma(target.name, target.value);
        let nextHighest = await db.collection("karma").aggregate([
            {
                $match: {karma: {$gt: targetKarma.value}}
            },
            {
                $project: {
                    name: 1,
                    karma: 1,
                    difference: {
                        $subtract: [targetKarma.value, "$karma"]
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
                $match: {karma: {$lt: targetKarma.value}}
            },
            {
                $project: {
                    name: 1,
                    karma: 1,
                    difference: {
                        $subtract: [targetKarma.value, "$karma"]
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