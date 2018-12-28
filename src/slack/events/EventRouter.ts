import * as Router from 'koa-router';
import slackVerifier from "../RequestVerifier";
import mongoConnector from "../../storage/MongoConnector";
import {KarmaRequest} from "../../parsing/KarmaParser";

/**
 * Routes incoming Slack events. Due to how the Slack API works, this router has to deal with not just "real" events,
 * but also with Slack Event API challenges - see https://api.slack.com/events/url_verification.
 */
class EventRouter {

    public addRoutes(router: Router): Router {
        router.post('/slack/events', slackVerifier.requestVerifier(), async (ctx) => {
                //If this is a slack challenge, answer with the challenge value.
                if (ctx.request.body.challenge != null) {
                    ctx.response.body = ctx.request.body.challenge;
                    return;
                }

                //Else, let the proper event service do its work.
                let foo = ctx.query.foo;
                console.log(ctx.request.body);
                ctx.response.body = {
                    message: `received foo: ${foo}`
                };
            }
        );


        //TODO: DEBUG
        router.post('/mongo/update', async (ctx) => {
            let request = new KarmaRequest(
                ctx.request.body.subject,
                ctx.request.body.amount
            );
            ctx.response.body = await mongoConnector.updateKarma(request);
        });
        router.get('/mongo/top', async (ctx) => {
            ctx.response.body = await mongoConnector.getLeaderboard();
        });

        return router;
    }
}

export default new EventRouter()
