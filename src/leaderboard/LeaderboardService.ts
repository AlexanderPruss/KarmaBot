import {Karma} from "../karma/Karma";
import mongoConnector, {MongoConnector} from "../storage/MongoConnector";

export class LeaderboardService{

    private mongoConnector: MongoConnector = mongoConnector;

    async getLeaderboard(sort: number = -1): Promise<Karma[]> {
        const db = await this.mongoConnector.reconnectAndGetDb();

        let leaderboard = await db.collection("karma").find()
            .sort({value: sort})
            .limit(5)
            .toArray();

        return leaderboard.map(
            (value => new Karma(value.name, value.karma)));
    }
}