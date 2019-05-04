/**
 *  When installing an app for the first time, Slack will redirect to the bot's auth
 *  endpoint and pass a code. This code is used to authenticate the bot for that team.
 */
export class AuthRequest {
    code: string;
}