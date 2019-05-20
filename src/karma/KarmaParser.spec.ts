import {KarmaParser} from "./KarmaParser";
import {expect} from 'chai';
import {Karma} from "./Karma";

const parser = new KarmaParser();
describe("KarmaParser", () => {

    describe("#parseMessage", () => {

        it("splits a string into words, each of which is parsed", () => {
            const expectedRequests = [
                new Karma("Foo", 1),
                new Karma("Bar", -1),
                new Karma("Bigfoo", 2),
                new Karma("Bigbar", -2)];

            const karmaRequests = parser.parseMessage("@Karmabot foo++ bar-- bigfoo+++ bigbar--- junk");

            expect(karmaRequests).to.eql(expectedRequests);
        });

        it("allows a single subject to receive multiple requests", () => {
            const expectedRequests = [
                new Karma("Foo", 1),
                new Karma("Foo", 2)];

            const karmaRequests = parser.parseMessage("@Karmabot foo++ foo+++");

            expect(karmaRequests).to.eql(expectedRequests);
        });

        it("Capitalizes the first letter of each request and ensures the rest are lowercase", () => {
            const expectedRequests = [
                new Karma("Foo", 1),
                new Karma("Foo", 2)];

            const karmaRequests = parser.parseMessage("@Karmabot FOO++ fOo+++");

            expect(karmaRequests).to.eql(expectedRequests);
        });

        it("ignores parse requests with no karma subject", () => {
            const karmaRequests = parser.parseMessage("@Karmabot ++");

            expect(karmaRequests).to.be.empty;
        })
    });

    describe("#parseWord", () => {

        it("ignores words without incrementers or decrementers", () => {
            const karmaRequests = parser.parseMessage("@Karmabot junk");
            expect(karmaRequests).to.be.empty;
        });

        it("ignores words with just one incrementer or decrementer", () => {
            const karmaRequests = parser.parseMessage("@Karmabot notAdded+ notSubtracted-");
            expect(karmaRequests).to.be.empty;
        });

        it("increments karma by one when it sees two incrementers", () => {
            const expectedRequest = new Karma("Foo", 1);

            const karmaRequests = parser.parseMessage("@Karmabot foo++");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("increments karma by n-1 when it sees n incrementers", () => {
            const expectedRequest = new Karma("Foo", 3);

            const karmaRequests = parser.parseMessage("@Karmabot foo++++");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("decrements karma by one when it sees two decrementers", () => {
            const expectedRequest = new Karma("Foo", -1);

            const karmaRequests = parser.parseMessage("@Karmabot foo--");

            expect(karmaRequests.length).to.eql(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("decrements karma by n-1 when it sees n decrementers", () => {
            const expectedRequest = new Karma("Foo", -3);

            const karmaRequests = parser.parseMessage("@Karmabot foo----");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("wraps user reference string in < > symbols", () => {
            const expectedRequest = new Karma("<@abc123>", 1);

            const karmaRequests = parser.parseMessage("@Karmabot @abc123++");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });
    });

    describe("#prettifyKarmaRequests", () => {
        it("capitalizes the first letter of each word and makes sure the rest are lowercase", () => {
            const expectedRequest = new Karma("Foo", -3);

            const karmaRequests = parser.parseMessage("@Karmabot fOO----");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        //TODO: Should I do it per word, or per request? Hmm.
        it("Prevents changing more than five karma in one single word", () => {
            const expectedRequests = [
                new Karma("Foo", 5),
                new Karma("Bar", -5)];

            const karmaRequests = parser.parseMessage("@Karmabot FOO++++++++++ bAr-------------");

            expect(karmaRequests).to.eql(expectedRequests);
        });

        it("allows Pia to receive more than five karma in one single word", () => {
            const expectedRequest = new Karma("Pia", 10);

            const karmaRequests = parser.parseMessage("@Karmabot pia+++++++++++");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("adds points to Pia instead of subtracting them", () => {
            const expectedRequest = new Karma("Pia", 10);

            const karmaRequests = parser.parseMessage("@Karmabot pia-----------");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });
    })
});
