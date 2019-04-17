import * as Config from 'config';

export class SlackConfig {

    appId: string;

    /**
     * clientId is sent with clientSecret for oauth.access requests.
     */
    clientId: string;

    /**
     * clientSecret is sent with clientId for oauth.access requests.
     */
    clientSecret: string;

    /**
     * Slack signs its requests with this token.
     */
    signingSecret: string;

    /**
     * The authentication for the bot.
     */
    botSecret: string;

}

class SlackConfigReader {

    public config: SlackConfig;

    constructor() {
        this.config = Config.get("slack");
    }
}

export default new SlackConfigReader().config
