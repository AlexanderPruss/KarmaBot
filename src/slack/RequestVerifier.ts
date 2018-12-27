import Koa = require('koa');
import crypto = require("crypto");
import slackConfig, {SlackConfig} from "./SlackConfig";

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

    public requestVerifier(): Koa.Middleware {

        return (ctx: Koa.Context, next: () => Promise<any>) => {
            let signature = ctx.get(SIGNATURE_HEADER);
            let timestamp: number = Number(ctx.get(TIMESTAMP_HEADER));
            let requestBody = ctx.request.rawBody;
            ctx.assert(this.checkSignature(signature, timestamp, requestBody));
            next();
        }
    }

    public checkSignature(signature: String, timestamp: number, requestBody: String): boolean {
        //Check the timestamp to defend against replay attacks.
        if (timestamp == null || Math.abs(new Date().getTime() / 1000 - timestamp) > FIVE_MINUTES_IN_SECONDS) {
            console.warn("Received an outdated Slack request.");
            console.warn(`Now:${new Date().getTime()} timestamp - ${timestamp}`);
            console.warn(`diff: ${new Date().getTime() - timestamp}`);
            console.warn(`Max allowed: ${FIVE_MINUTES_IN_SECONDS}`);
            return false;
        }

        let hmac = crypto.createHmac('sha256', this.config.signingSecret.toString());

        let stringToHash = `v0:${timestamp}:${requestBody}`;
        let computedSignature = "v0=" + hmac.update(stringToHash).digest('hex');

        if (computedSignature !== signature) {
            console.warn("Received a slack request with a bad signature.");
        }

        return computedSignature === signature;
    }

}

export default new RequestVerifier();