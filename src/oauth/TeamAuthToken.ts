/**
 * The auth token that is sent from Slack after authenticating the bot with a team. These are saved per-team.
 * See https://api.slack.com/docs/oauth
 */
import {ObjectID} from "bson";

export class TeamAuthToken {
    _id : ObjectID
    access_token: string;
    scope: string;
    team_name: string;
    team_id: string;
    bot: BotToken;
}

export class BotToken {
    bot_user_id: string;
    bot_access_token: string;
}