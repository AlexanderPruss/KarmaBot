export class Karma {
    subject: String;
    amount: number;

    constructor(karmaSubject: String, requestedChange: number) {
        this.subject = karmaSubject;
        this.amount = requestedChange;
    }
}