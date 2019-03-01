/**
 * Just a glorified key-value holder.
 */
export class Karma {
    subject: String;
    amount: number;

    constructor(karmaSubject: String, requestedChange: number) {
        this.subject = karmaSubject;
        this.amount = requestedChange;
    }
}

const INCREMENTER = "+";
const DECREMENTER = "-";

//Parses a message sent to the bot and translates it into a collection of Karma requests.
export class KarmaParser {

    public parseMessage(message: String): Karma[] {
        let karmaRequests = [];
        message = message.toLowerCase();

        message.split(" ").forEach((word) => {

                let karmaRequest = this.parseWord(word);
                if (karmaRequest.amount == 0 || karmaRequest.subject === "") {
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
     * Ex:
     *  C++ -> increment C by one
     *  Dog+++ -> increment Dog by two
     *  Disaster--- -> decrement Disaster by two.
     *
     *  Also fun - '' to identify a special thing? hmmmmm
     */
    private parseWord(word: string): Karma {
        let activeSymbol: String = null;

        //If the word doesn't end in a + or -, skip it.
        let lastCharacter = word.charAt(word.length - 1);
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
        //TODO: This would let me say "c++"++ to increment the karma of c++.

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
            let request = requests[i];
            let karmaSubject = request.subject;

            //Capitalized karma looks pretty
            request.subject = karmaSubject.charAt(0).toUpperCase() + karmaSubject.slice(1);

            //Pia can't lose points.
            if (request.subject === "Pia" && request.amount < 0) {
                request.amount *= -1;
            }

            //Everyone except Pia can't change their karma by more than 5 at a time.
            if (request.subject !== "Pia") {
                if (request.amount > 5) {
                    request.amount = 5;
                }
                if (request.amount < -5) {
                    request.amount = -5;
                }
            }
        }
        return requests;
    }

}

export default new KarmaParser();