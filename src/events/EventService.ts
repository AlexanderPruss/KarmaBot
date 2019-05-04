import axios from 'axios';
import slackConfig, {SlackConfig} from "./SlackConfig";
import logger from "../logging/Logger";
import {BotToken} from "../oauth/TeamAuthToken";

/**
 * The event service is the orchestrator of the app. It sends event information onto each handler.
 */
export class EventService {

    config: SlackConfig = slackConfig;

    public async respondWithMessage(message: string, channel: string, token: BotToken) {
        logger.info("Sending response message.");
        await axios.post("https://slack.com/api/chat.postMessage",
            {
                text: message,
                channel: channel
            },
            {
                headers: {
                    Authorization: `Bearer ${token.bot_access_token}`
                }
            });
    }

}

export default new EventService();