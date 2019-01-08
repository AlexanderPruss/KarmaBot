import {Karma} from "../parsing/KarmaParser";

export class KarmaNeighbors {
    karma : Karma;
    previousKarma: Karma;
    nextKarma: Karma;


    constructor(karma: Karma, previousKarma: Karma, nextKarma: Karma) {
        this.karma = karma;
        this.previousKarma = previousKarma;
        this.nextKarma = nextKarma;
    }

}