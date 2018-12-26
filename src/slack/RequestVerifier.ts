import Koa = require('koa');
import crypto = require("crypto");
import slackConfig, {SlackConfig} from "./SlackConfig";

const SIGNATURE_HEADER = "X-Slack-Signature";
const TIMESTAMP_HEADER = "X-Slack-Request-Timestamp";
const FIVE_MINUTES_IN_MS = 5 * 1000 * 60;

/**
 * See https://api.slack.com/docs/verifying-requests-from-slack.
 * Short version - every Slack request comes with a signature. Using our signing secret, we
 * compute a hash of the request body. If the hash manages the signature, then it's a legitimate
 * request.
 *
 * This algorithm is implemented as Koa middleware and turned on for Slack requests.
 */
class RequestVerifier {

    config: SlackConfig;

    constructor() {
        this.config = slackConfig;
    }

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
        if (timestamp == null || Math.abs(new Date().getTime() - timestamp) > FIVE_MINUTES_IN_MS) {
            console.warn("Received an outdated Slack request.");
            return false;
        }

        let hmac = crypto.createHmac('sha256', this.config.signingSecret.toString());

        let signatureString = `v0:${timestamp}:${requestBody}`;
        let computedSignature = hmac.update(signatureString).digest('hex');

        //TODO: Proper logging is obviously a thing we need
        console.log(`computedSig: ${computedSignature}`);
        console.log(`Slack sig - ${signature}`);

        return computedSignature.toString() === signature;
    }

}

export default new RequestVerifier();