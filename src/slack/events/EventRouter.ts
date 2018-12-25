import * as Router from 'koa-router';

/**
 * Routes incoming Slack events. Due to how the Slack API works, this router has to deal with not just "real" events,
 * but also with Slack Event API challenges - see https://api.slack.com/events/url_verification.
 */
class EventRouter {

    public addRoutes(router: Router): Router {
        router.post('/slack/events', async (ctx) => {
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
        return router;
    }
}

export default new EventRouter()
