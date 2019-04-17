import karmaParser from "../karma/KarmaParser";
import karmaService from "../karma/KarmaService";
import axios from 'axios';
import slackConfig, {SlackConfig} from "./SlackConfig";
import {Karma} from "../karma/Karma";

/**
 * The event service is the main orchestrator of the app.
 */
class EventService {

    config: SlackConfig = slackConfig;

    public async handleEvent(event: EventData) {
        console.log("Handling event.");
        let karmaRequests = karmaParser.parseMessage(event.text);
        //TODO: let leaderboard = leaderboardParser.checkForLeaderboards();

        let updatedKarmaPromise = karmaRequests.map(karma => {
            return karmaService.updateKarma(karma)
        });
        let updatedKarmas = await Promise.all(updatedKarmaPromise);
        console.log("Updated karma.");

        let responseMessagePromise = updatedKarmas.map(this.toResponseMessage);
        let responseMessages = await Promise.all(responseMessagePromise);
        console.log("Constructed response messages.");

        this.respondWithMessage(responseMessages.join("\n-----\n"), event.channel);
    }

    public async toResponseMessage(updatedKarma: Karma): Promise<String> {
        let karmaNeighbors = await karmaService.getKarmaNeighbors(updatedKarma.name.toString());

        let message = `${karmaNeighbors.karma.name} now has ${karmaNeighbors.karma.value} karma.`;

        if (karmaNeighbors.nextKarma != null) {
            message += ` ${karmaNeighbors.nextKarma.name} has the next highest karma, with ${karmaNeighbors.nextKarma.value} karma.`
        }
        if (karmaNeighbors.previousKarma != null) {
            message += ` ${karmaNeighbors.previousKarma.name} has the next lowest karma, with ${karmaNeighbors.previousKarma.value} karma.`
        }

        return message;
    }

    public respondWithMessage(message: string, channel: string) {
        console.log("Sending response message.");
        axios.post("https://slack.com/api/chat.postMessage",
            {
                text: message,
                channel: channel
            },
            {
                headers: {
                    Authorization: slackConfig.botSecret
                }
            })
            .then(function (response) {
                console.log("Response sent successfully.");
            }).catch(function (error) {
            console.error(`Error from Slack: ${error}.`)
        });
    }

}

/**
 * This is an aid in deserializing Slack events.
 */
export class IncomingSlackEvent {
    event: EventData;
}

class EventData {
    text: string;
    channel: string;
}

export default new EventService();