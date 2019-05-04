import {TeamAuthToken} from "../TeamAuthToken";

export function defaultTeamAuthToken(teamId: string): TeamAuthToken {
    const token = {
        _id: null,
        team_id: teamId,
        team_name: "Lakers",
        access_token: "12345",
        scope: "bot",
        bot: {
            bot_access_token: "xoxbot",
            bot_user_id: "karmabot"
        }
    };
    delete token._id;
    return token;
}