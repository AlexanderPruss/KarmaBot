import karmaUpdateHandler, {KarmaUpdateHandler} from "../karma/KarmaUpdateHandler";
import logger from "../logging/Logger";
import requestVerifier from "./RequestVerifier"

/**
 * Routes incoming Slack events. Due to how the Slack API works, this router has to deal with not just "real" events,
 * but also with Slack Event API challenges - see https://api.slack.com/events/url_verification.
 */
class EventHandler {

    private karmaUpdateHandler: KarmaUpdateHandler = karmaUpdateHandler;

    public handleApiGatewayEvent(event: APIGatewayEvent) : APIGatewayOutput {
        if(!requestVerifier.verifyEvent(event)) {
            return {
                statusCode: 403,
                isBase64Encoded: false,
                body: "Unauthorized"
            }
        }

        const body = JSON.parse(event.body);
        //If this is a slack challenge, answer with the challenge value.
        if (body.challenge != null) {
            logger.info("Answering Slack challenge.");
            return {
                    statusCode: 200,
                    isBase64Encoded: false,
                    body: body.challenge
                };
        }

        //Else, respond immediately with a 200 (as requested by the Slack Event API.)
        //Do the work of processing the event in a separate thread.
        const slackEvent: IncomingSlackEvent = body;
        if (slackEvent.event == null || slackEvent.event.text == null || slackEvent.event.channel == null) {
            logger.warn("Didn't receive a valid event.");
            return {
                statusCode: 401,
                isBase64Encoded: false,
                body: "Couldn't parse slack event."
            };
        }

        this.karmaUpdateHandler.handleEvent(slackEvent.event);

        return {
            statusCode: 200,
            isBase64Encoded: false,
            body: "Event processing."
        };
    }
}

export class APIGatewayEvent {
    body: string;
    headers: any;
    path: string;
}

export class APIGatewayOutput {
    isBase64Encoded = false;
    statusCode: number;
    body: string;
}

export class IncomingSlackEvent {
    event: EventData;
}

export class EventData {
    text: string;
    channel: string;
}

export default new EventHandler()
