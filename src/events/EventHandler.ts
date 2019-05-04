import karmaUpdateHandler, {KarmaUpdateHandler} from "../karma/KarmaUpdateHandler";
import logger from "../logging/Logger";
import requestVerifier, {RequestVerifier} from "./RequestVerifier"
import authService, {OAuthService} from "../oauth/OAuthService";
import {TeamAuthToken} from "../oauth/TeamAuthToken";

/**
 * Routes incoming Slack events. Due to how the Slack API works, this router has to deal with not just "real" events,
 * but also with Slack Event API challenges and auth0- see https://api.slack.com/events/url_verification.
 *
 * Apparently, Slack request verification will fail for Slack auth0 requests. So we only do request verification
 * for non-auth0 requests
 */
export class EventHandler {

    authService: OAuthService = authService;
    karmaUpdateHandler: KarmaUpdateHandler = karmaUpdateHandler;
    requestVerifier: RequestVerifier = requestVerifier;

    public async handleApiGatewayEvent(event: APIGatewayEvent): Promise<APIGatewayOutput> {
        if(event.queryStringParameters != null && event.queryStringParameters["auth"] != null) {
            logger.info("Authorizing with auth0");
            try {
                logger.info("Auth 0 request: " + event.body);
                await this.authService.authorizeTeam(JSON.parse(event.body));
            } catch (error) {
                logger.error("Failed to authorize with auth0.", error);
                return {
                    statusCode: 403,
                    isBase64Encoded: false,
                    body: "Unauthorized - failed auth0 check"
                }
            }
            return {
                statusCode: 200,
                isBase64Encoded: false,
                body: "Authorization successful"
            }
        }

        if (!this.requestVerifier.verifyEvent(event)) {
            return {
                statusCode: 403,
                isBase64Encoded: false,
                body: "Unauthorized - failed verification"
            }
        }

        logger.info("Query Parameters: " + event.queryStringParameters);
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
        const token : TeamAuthToken = await this.authService.getTeamToken(slackEvent.team_id);
        if (slackEvent.event == null || slackEvent.event.text == null || slackEvent.event.channel == null) {
            logger.warn("Didn't receive a valid event.");
            return {
                statusCode: 401,
                isBase64Encoded: false,
                body: "Couldn't parse slack event."
            };
        }

        //TODO: Need to see if this is too slow. But if we don't await here, then the lambda
        //TODO: completes before the threads it spawned have!
        await this.karmaUpdateHandler.handleEvent(slackEvent.event, token);

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
    queryStringParameters: any;
}

export class APIGatewayOutput {
    isBase64Encoded = false;
    statusCode: number;
    body: string;
}

export class IncomingSlackEvent {
    event: EventData;
    team_id: string;
}

export class EventData {
    text: string;
    channel: string;
}

export default new EventHandler()
