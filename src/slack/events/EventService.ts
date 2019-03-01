import karmaParser, {Karma} from "../../parsing/KarmaParser";
import mongoConnector from "../../storage/MongoConnector";
import axios from 'axios';
import slackConfig, {SlackConfig} from "../SlackConfig";

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
            return mongoConnector.updateKarma(karma)
        });
        let updatedKarmas = await Promise.all(updatedKarmaPromise);
        console.log("Updated karma.");

        let responseMessagePromise = updatedKarmas.map(this.toResponseMessage);
        let responseMessages = await Promise.all(responseMessagePromise);
        console.log("Constructed response messages.");

        this.respondWithMessage(responseMessages.join("\n-----\n"), event.channel);
    }

    public async toResponseMessage(updatedKarma: Karma): Promise<String> {
        let karmaNeighbors = await mongoConnector.getKarmaNeighbors(updatedKarma.subject.toString());

        let message = `${karmaNeighbors.karma.subject} now has ${karmaNeighbors.karma.amount} karma.`;

        if (karmaNeighbors.nextKarma != null) {
            message += ` ${karmaNeighbors.nextKarma.subject} has the next highest karma, with ${karmaNeighbors.nextKarma.amount} karma.`
        }
        if (karmaNeighbors.previousKarma != null) {
            message += ` ${karmaNeighbors.previousKarma.subject} has the next lowest karma, with ${karmaNeighbors.previousKarma.amount} karma.`
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