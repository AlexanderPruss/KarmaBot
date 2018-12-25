import Koa = require('koa');

/**
 * See https://api.slack.com/docs/verifying-requests-from-slack.
 * Short version - every Slack request comes with a signature. Using our signing secret, we
 * compute a hash of the request body. If the hash manages the signature, then it's a legitimate
 * request.
 *
 * This algorithm is implemented as Koa middleware and turned on for Slack requests.
 */
class RequestVerifier {

    public requestVerifier(): Koa.Middleware {
        return (ctx: Koa.Context, next: () => Promise<any>) => {
            console.log("Activated the request verifier middleware.");
        }
    }

    public checkSignature(signature: String, timestamp: String, requestBody: String) : boolean {


        return false;
    }

}

export default new RequestVerifier();