import axios from 'axios';
import slackConfig, {SlackConfig} from "./SlackConfig";
import logger from "../logging/Logger";

/**
 * The event service is the orchestrator of the app. It sends event information onto each handler.
 */
export class EventService {

    config: SlackConfig = slackConfig;

    public async respondWithMessage(message: string, channel: string) {
        logger.info("Sending response message.");
        axios.post("https://slack.com/api/chat.postMessage",
            {
                text: message,
                channel: channel
            },
            {
                headers: {
                    Authorization: slackConfig.botSecret
                }
            })
            .then(function (response) {
                logger.info("Response sent successfully.");
            }).catch(function (error) {
            console.error(`Error from Slack: ${error}.`)
        });
    }

}

export default new EventService();