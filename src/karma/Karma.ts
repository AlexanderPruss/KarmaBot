export class Karma {
    subject: string;
    amount: number;

    constructor(karmaSubject: string, requestedChange: number) {
        this.subject = karmaSubject;
        this.amount = requestedChange;
    }
}