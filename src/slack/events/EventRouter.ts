import * as Router from 'koa-router';
import slackVerifier from "../RequestVerifier";
import mongoConnector from "../../storage/MongoConnector";
import {Karma} from "../../parsing/KarmaParser";
import eventService, {IncomingSlackEvent} from "./EventService";

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

                //Else, respond immediately with a 200 (as requested by the Slack Event API.)
                //Do the work of processing the event in a separate thread.
                ctx.response.status=200;
                let slackEvent : IncomingSlackEvent = ctx.request.body;
                if(slackEvent.event != null && slackEvent.event.text != null && slackEvent.event.channel != null) { //TODO: Validation should happen elsewhere
                    return;
                }

                eventService.handleEvent(slackEvent.event);
            }
        );


        //TODO: DEBUG
        router.post('/mongo/update', async (ctx) => {
            let request = new Karma(
                ctx.request.body.subject,
                ctx.request.body.amount
            );
            ctx.response.body = await mongoConnector.updateKarma(request);
        });
        router.get('/mongo/top', async (ctx) => {
            ctx.response.body = await mongoConnector.getLeaderboard();
        });
        router.post('/mongo/neighbors', async (ctx) => {
            ctx.response.body = await mongoConnector.getKarmaNeighbors(ctx.request.body.subject);
        });

        return router;
    }
}

export default new EventRouter()
