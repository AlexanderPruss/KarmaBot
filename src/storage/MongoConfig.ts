import * as Config from 'config';

export class MongoConfig {

    connectionString: String;

}

class MongoConfigReader {

    public config: MongoConfig;

    constructor() {
        this.config = Config.get("mongo");
    }
}

export default new MongoConfigReader().config
