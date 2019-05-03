import * as Config from 'config';

export class MongoConfig {

    connectionString: string;

}

class MongoConfigReader {

    public config: MongoConfig;

    constructor() {
        this.config = Config.get("mongo");
    }
}

export default new MongoConfigReader().config
