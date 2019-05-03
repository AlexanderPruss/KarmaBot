import karmaParser from "./KarmaParser";
import karmaService from "./KarmaService";
import logger from "../logging/Logger";
import eventService, {EventService} from "../events/EventService";
import {Karma} from "./Karma";
import {EventData} from "../events/EventHandler";

export class KarmaUpdateHandler {

    private eventService: EventService = eventService;

    async handleEvent(event: EventData) {
        logger.info("Checking for possible karma updates.");

        const karmaRequests = karmaParser.parseMessage(event.text);
        if (karmaRequests.length == 0) {
            logger.info("No karma updates found.");
            return;
        }

        const updatedKarmaPromises = karmaRequests.map(karma => {
            return karmaService.updateKarma(karma)
        });
        const updatedKarmas = await Promise.all(updatedKarmaPromises);
        logger.info("Updated karma.");

        const responseMessagePromise = updatedKarmas.map(this.toResponseMessage);
        const responseMessages = await Promise.all(responseMessagePromise);
        logger.info("Constructed response messages.");

        this.eventService.respondWithMessage(responseMessages.join("\n-----\n"), event.channel);
    }

    async toResponseMessage(updatedKarma: Karma): Promise<String> {
        const karmaNeighbors = await karmaService.getKarmaNeighbors(updatedKarma.name.toString());

        let message = `${karmaNeighbors.karma.name} now has ${karmaNeighbors.karma.value} karma.`;
        if (karmaNeighbors.nextKarma != null) {
            message += ` ${karmaNeighbors.nextKarma.name} has the next highest karma, with ${karmaNeighbors.nextKarma.value} karma.`
        }
        if (karmaNeighbors.previousKarma != null) {
            message += ` ${karmaNeighbors.previousKarma.name} has the next lowest karma, with ${karmaNeighbors.previousKarma.value} karma.`
        }

        return message;
    }
}

export default new KarmaUpdateHandler();