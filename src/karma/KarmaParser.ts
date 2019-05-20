import {Karma} from "./Karma";

const INCREMENTER = "+";
const DECREMENTER = "-";
const ID_PREFIX = "<";

//Parses a message sent to the bot and translates it into a collection of Karma requests.
export class KarmaParser {

    public parseMessage(message: string): Karma[] {
        const karmaRequests = [];
        //TODO: nope  message = message.toLowerCase();

        message.split(" ").forEach((word) => {

                const karmaRequest = this.parseWord(word);
                if (karmaRequest.value == 0 || karmaRequest.name === "") {
                    return;
                }

                karmaRequests.push(karmaRequest);
            }
        );

        return this.prettifyKarmaRequests(karmaRequests);
    }

    /**
     * When parsing a word, we want to look for strings of +'s and -'s at the end of the word that are
     * at least two long. The amount to increment/decrement is equal to the number of incrementers/decrementers
     * minus one. That way `++` results in a single incrementation.
     *
     * We also want to check if the word is a user reference and if so format it accordingly. Slack makes it
     * easy for us, as it automatically changes the user display name to the user id before passing it to the bot.
     * I. e. "@JohnDoe" becomes "@abc123"
     *
     * Ex:
     *  C++ -> increment C by one
     *  Dog+++ -> increment Dog by two
     *  Disaster--- -> decrement Disaster by two.
     *
     *  Also fun - '' to identify a special thing? hmmmmm
     */
    private parseWord(word: string): Karma {
        let activeSymbol: string = null;

        //If the word doesn't end in a + or -, skip it.
        const lastCharacter = word.charAt(word.length - 1);

        if (lastCharacter == INCREMENTER) {
            activeSymbol = INCREMENTER;
        } else if (lastCharacter == DECREMENTER) {
            activeSymbol = DECREMENTER;
        } else {
            return new Karma("", 0);
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

        //TODO: Can clean the subject here if we want, by removing quotation marks and such.
        //TODO: This would const me say "c++"++ to increment the karma of c++.

        if (activeSymbol == DECREMENTER) {
            requestedChange *= -1;
        }

        return new Karma(karmaSubject, requestedChange);
    }

    /**
     * Check some boundary conditions:
     * capitalize the first letter of each word,
     * check the limit of a maximum change of 5,
     * make sure Pia doesn't lose points.
     */
    private prettifyKarmaRequests(requests: Karma[]): Karma[] {
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];

            //Capitalized karma looks pretty. We don't change the capitalization if it's an ID request, however, as
            //that would break the ID reference
            if (request.name.charAt(0) != ID_PREFIX) {
                request.name = request.name.toLowerCase();
                request.name = request.name.charAt(0).toUpperCase() + request.name.slice(1);
            }

            //Pia can't lose points.
            if (request.name === "Pia" && request.value < 0) {
                request.value *= -1;
            }

            //Everyone except Pia can't change their karma by more than 5 at a time.
            if (request.name !== "Pia") {
                if (request.value > 5) {
                    request.value = 5;
                }
                if (request.value < -5) {
                    request.value = -5;
                }
            }
        }
        return requests;
    }

}

export default new KarmaParser();
