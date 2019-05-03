import crypto = require("crypto");
import slackConfig, {SlackConfig} from "./SlackConfig";
import {APIGatewayEvent} from "./EventHandler";
import logger from "../logging/Logger";

const SIGNATURE_HEADER = "X-Slack-Signature";
const TIMESTAMP_HEADER = "X-Slack-Request-Timestamp";
const FIVE_MINUTES_IN_SECONDS = 300;

/**
 * See https://api.slack.com/docs/verifying-requests-from-slack.
 * Short version - every Slack request comes with a signature. Using our signing secret, we
 * compute a hash of the request body. If the hash matches the signature, then it's a legitimate
 * request.
 *
 * This algorithm is implemented as Koa middleware and turned on for Slack requests.
 */
class RequestVerifier {

    config: SlackConfig = slackConfig;

    public verifyEvent(event: APIGatewayEvent): boolean {
        logger.info("Verifying an incoming slack event.");
        const signature = event.headers[SIGNATURE_HEADER];
        const timestamp = Number(event.headers[TIMESTAMP_HEADER]);
        return this.checkSignature(signature, timestamp, event.body);
    }

    public checkSignature(signature: string, timestamp: number, requestBody: string): boolean {
        //Check the timestamp to defend against replay attacks.
        if (timestamp == null || Math.abs(new Date().getTime() / 1000 - timestamp) > FIVE_MINUTES_IN_SECONDS) {
            logger.warn("Received an outdated Slack request.");
            logger.warn(`Now:${new Date().getTime()} timestamp - ${timestamp}`);
            logger.warn(`diff: ${new Date().getTime() - timestamp}`);
            logger.warn(`Max allowed: ${FIVE_MINUTES_IN_SECONDS}`);
            return false;
        }

        const hmac = crypto.createHmac('sha256', this.config.signingSecret.toString());

        const stringToHash = `v0:${timestamp}:${requestBody}`;
        const computedSignature = "v0=" + hmac.update(stringToHash).digest('hex');

        if (computedSignature !== signature) {
            logger.warn("Received a slack request with a bad signature.");
        }

        return computedSignature === signature;
    }

}

export default new RequestVerifier();