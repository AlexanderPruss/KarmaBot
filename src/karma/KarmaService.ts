import {Karma} from "./Karma";
import {KarmaNeighbors} from "./KarmaNeighbors";
import mongoConnector, {MongoConnector} from "../storage/MongoConnector";
import logger from "../logging/Logger";

/**
 * KarmaService is in charge of database operations for Karma.
 */
export class KarmaService {

    mongoConnector: MongoConnector = mongoConnector;

    /**
     * Returns the karma with the given name, or null if no such karma can be found.
     * @param name
     */
    async findKarma(name: string) : Promise<Karma> {
        logger.info(`Finding karma with name ${name}.`);

        const db = await this.mongoConnector.reconnectAndGetDb();
        const foundKarma : Karma[] = await db.collection("karma").find({name: {$eq: name}}).toArray();

        if (foundKarma.length == 0) {
            logger.warn(`Couldn't find karma with name ${name}.`);
            return null;
        }

        //This should be impossible. Famous last words
        if (foundKarma.length > 1) {
            logger.error(`Database consistency error - multiple karmas with name ${name} found.`);
            throw new Error(`Database consistency error - multiple karmas with name ${name} found.`);
        }

        return {name: foundKarma[0].name, value: foundKarma[0].value};
    }

    async updateKarma(karma: Karma): Promise<Karma> {
        const db = await this.mongoConnector.reconnectAndGetDb();

        let updateResult = await db.collection("karma").findOneAndUpdate(
            {name: karma.name},
            {
                $set: {name: karma.name},
                $inc: {value: karma.value}
            },
            {upsert: true});

        return this.findKarma(karma.name);
    }

    /**
     * Finds the karma of the given name, as well as its neighbors.
     */
    async getKarmaNeighbors(name: string): Promise<KarmaNeighbors> {
        logger.info(`Finding karma neighbors for ${name}`);
        const db = await this.mongoConnector.reconnectAndGetDb();
        let targetKarma = await this.findKarma(name);
        if (targetKarma == null) {
            return new KarmaNeighbors(null, null, null);
        }

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

        let nextHighestKarma : Karma = nextHighest.length == 0 ?
            null : {name: nextHighest[0].name, value: nextHighest[0].value};
        let nextLowestKarma : Karma = nextLowest.length == 0 ?
            null : {name: nextLowest[0].name, value: nextLowest[0].value};

        return new KarmaNeighbors(targetKarma, nextLowestKarma, nextHighestKarma);
    }
    //TODO: Hmm. Do I want to somehow handle multiple names having the same karma?
    //TODO: ... how about just count how many other things with that same karma there are?
}

export default new KarmaService();