export class Karma {
    name: string;
    value: number;

    constructor(karmaSubject: string, requestedChange: number) {
        this.name = karmaSubject;
        this.value = requestedChange;
    }
}