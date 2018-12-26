import {KarmaParser, KarmaRequest} from "./KarmaParser";
import {expect} from 'chai';

let parser = new KarmaParser();
describe("KarmaParser", () => {

    describe("#parseMessage", () => {

        it("splits a string into words, each of which is parsed.", () => {
            const expectedRequests = [
                new KarmaRequest("foo", 1),
                new KarmaRequest("bar", -1),
                new KarmaRequest("bigfoo", 2),
                new KarmaRequest("bigbar", -2)];

            const karmaRequests = parser.parseMessage("@Karmabot foo++ bar-- bigfoo+++ bigbar--- junk");

            expect(karmaRequests).to.eql(expectedRequests);
        });

        it("allows a single subject to receive multiple requests", () => {
            const expectedRequests = [
                new KarmaRequest("foo", 1),
                new KarmaRequest("foo", 2)];

            const karmaRequests = parser.parseMessage("@Karmabot foo++ foo+++");

            expect(karmaRequests).to.eql(expectedRequests);
        });

        it("converts incoming strings to lowercase", () => {
            const expectedRequests = [
                new KarmaRequest("foo", 1),
                new KarmaRequest("foo", 2)];

            const karmaRequests = parser.parseMessage("@Karmabot FOO++ fOo+++");

            expect(karmaRequests).to.eql(expectedRequests);
        });
    });

    describe("#parseWord", () => {

        it("ignores words without incrementers or decrementers", () => {
            const karmaRequests = parser.parseMessage("@Karmabot junk");
            expect(karmaRequests.length).to.equal(0);
        });

        it("ignores words with just one incrementer or decrementer", () => {
            const karmaRequests = parser.parseMessage("@Karmabot notAdded+ notSubtracted-");
            expect(karmaRequests.length).to.equal(0);
        });

        it("increments karma by one when it sees two incrementers", () => {
            const expectedRequest = new KarmaRequest("foo", 1);

            const karmaRequests = parser.parseMessage("@Karmabot foo++");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("increments karma by n-1 when it sees n incrementers", () => {
            const expectedRequest = new KarmaRequest("foo", 3);

            const karmaRequests = parser.parseMessage("@Karmabot foo++++");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("decrements karma by one when it sees two decrementers", () => {
            const expectedRequest = new KarmaRequest("foo", -1);

            const karmaRequests = parser.parseMessage("@Karmabot foo--");

            expect(karmaRequests.length).to.eql(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });

        it("decrements karma by n-1 when it sees n decrementers", () => {
            const expectedRequest = new KarmaRequest("foo", -3);

            const karmaRequests = parser.parseMessage("@Karmabot foo----");

            expect(karmaRequests.length).to.equal(1);
            expect(karmaRequests[0]).to.eql(expectedRequest);
        });
    });
});