import * as Config from 'config';

export class SlackConfig {

    appId: String;

    /**
     * clientId is sent with clientSecret for oauth.access requests.
     */
    clientId: String;

    /**
     * clientSecret is sent with clientId for oauth.access requests.
     */
    clientSecret: String;

    /**
     * Slack signs its requests with this token.
     */
    signingSecret: String;

}

class SlackConfigReader {

    public config: SlackConfig;

    constructor() {
        this.config = Config.get("slack");
    }
}

export default new SlackConfigReader().config
