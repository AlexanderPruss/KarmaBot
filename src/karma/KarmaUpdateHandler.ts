import karmaParser, {KarmaParser} from "./KarmaParser";
import karmaService, {KarmaService} from "./KarmaService";
import logger from "../logging/Logger";
import eventService, {EventService} from "../events/EventService";
import {Karma} from "./Karma";
import {EventData} from "../events/EventHandler";
import {TeamAuthToken} from "../oauth/TeamAuthToken";

export class KarmaUpdateHandler {

    eventService: EventService = eventService;
    karmaService: KarmaService = karmaService;
    karmaParser: KarmaParser = karmaParser;

    async handleEvent(event: EventData, token: TeamAuthToken) {
        logger.info("Checking for possible karma updates.");

        const karmaRequests = this.karmaParser.parseMessage(event.text);
        if (karmaRequests.length == 0) {
            logger.info("No karma updates found.");
            return;
        }

        const updatedKarmaPromises = karmaRequests.map(karma => {
            return this.karmaService.updateKarma(karma, token.team_id)
        });
        const updatedKarmas = await Promise.all(updatedKarmaPromises);
        logger.info("Updated karma.");

        const responseMessagePromises: Promise<string>[] = [];
        for(const karma of updatedKarmas) {
            responseMessagePromises.push(this.toResponseMessage(karma, token.team_id));
        }
        const responseMessages = await Promise.all(responseMessagePromises);

        await this.eventService.respondWithMessage(responseMessages.join("\n-----\n"), event.channel, token.bot);
    }

   private async toResponseMessage(updatedKarma: Karma, teamId: string): Promise<string> {
        const karmaNeighbors = await this.karmaService.getKarmaNeighbors(updatedKarma.name, teamId);
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