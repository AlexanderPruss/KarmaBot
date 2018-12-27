/**
 * A command for the Karmabot to change the karma of the subject by a positive or negative amount.
 * This is currently just a key/value, but it's its own class to make it easier to add more complicated
 * commands in the future.
 */
export class KarmaRequest {
    karmaSubject: String;
    requestedChange: number;

    constructor(karmaSubject: String, requestedChange: number) {
        this.karmaSubject = karmaSubject;
        this.requestedChange = requestedChange;
    }
}

const INCREMENTER = "+";
const DECREMENTER = "-";

//Parses a message sent to the bot and translates it into a collection of KaramRequests.
export class KarmaParser {

    public parseMessage(message: String): KarmaRequest[] {
        let karmaRequests = [];
        message = message.toLowerCase();

        message.split(" ").forEach(
            (word, index) => {

                console.log(index + word);
                let karmaRequest = this.parseWord(word);
                if (karmaRequest.requestedChange == 0) {
                    return;
                }

                karmaRequests.push(karmaRequest);
            }
        );

        return karmaRequests;
    }

    /**
     * When parsing a word, we want to look for strings of +'s and -'s at the end of the word that are
     * at least two long. The amount to increment/decrement is equal to the number of incrementers/decrementers
     * minus one. That way `++` results in a single incrementation.
     *
     * Ex:
     *  C++ -> increment C by one
     *  Dog+++ -> increment Dog by one
     *  Disaster--- -> decrement Disaster by two.
     *
     *  Also fun - '' to identify a special thing? hmmmmm
     */
    private parseWord(word: string): KarmaRequest {
        let activeSymbol: String = null;

        //If the word doesn't end in a + or -, skip it.
        let lastCharacter = word.charAt(word.length - 1);
        if (lastCharacter == INCREMENTER) {
            activeSymbol = INCREMENTER;
        } else if (lastCharacter == DECREMENTER) {
            activeSymbol = DECREMENTER;
        } else {
            return new KarmaRequest("", 0);
        }

        let karmaSubject = "";
        let requestedChange = -1;
        for (let i = word.length - 1; i >= 0; i--) {
            if (word.charAt(i) != activeSymbol) {
                karmaSubject = word.substring(0, i + 1);
                break;
            }
            requestedChange++;
        }

        //TODO: Can clean the karmaSubject here if we want, by removing quotation marks and such.
        //TODO: This would let me say "c++"++ to increment the karma of c++.

        if (activeSymbol == DECREMENTER) {
            requestedChange *= -1;
        }

        return new KarmaRequest(karmaSubject, requestedChange);
    }

}