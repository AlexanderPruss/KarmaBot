import requestVerifier from "./RequestVerifier";
import {SlackConfig} from "./SlackConfig";

import {expect} from 'chai';
import crypto = require("crypto");

const testConfig = new SlackConfig();
testConfig.signingSecret = "testSecret";
requestVerifier.config = testConfig;

describe("RequestVerifier", () => {

    describe("#checkSignature", () => {

        it("returns false if the timestamp is null or undefined", () => {
            const nullTimestamp = requestVerifier.checkSignature(getSignatureOfFoo(null), null, "foo");
            const undefinedTimestamp = requestVerifier.checkSignature(getSignatureOfFoo(undefined), undefined, "foo");

            expect(nullTimestamp).to.be.false;
            expect(undefinedTimestamp).to.be.false;
        });

        it("returns false if the timestamp is more than five minutes out of date", () => {
            const now: number = new Date().getTime() / 1000;
            const fiveMinutesEarlier = now - 301;
            const fiveMinutesLater = now + 301;

            const tooEarly = requestVerifier.checkSignature(getSignatureOfFoo(fiveMinutesLater), fiveMinutesEarlier, "foo");
            const tooLate = requestVerifier.checkSignature(getSignatureOfFoo(fiveMinutesLater), fiveMinutesLater, "foo");

            expect(tooEarly).to.be.false;
            expect(tooLate).to.be.false;

        });

        it("returns false if the computed signatures don't match", () => {
            const now: number = new Date().getTime() / 1000;

            const badSignature = requestVerifier.checkSignature("nonsense", now, "foo");

            expect(badSignature).to.be.false;
        });

        it("returns true if the signatures match and the timestamp is about right", () => {
            const now: number = new Date().getTime() / 1000;
            const fourMinutesEarlier = now - 240;
            const fourMinutesLater = now + 240;

            const goodEarlyVerification = requestVerifier.checkSignature(getSignatureOfFoo(fourMinutesEarlier), fourMinutesEarlier, "foo");
            const goodLateVerification = requestVerifier.checkSignature(getSignatureOfFoo(fourMinutesLater), fourMinutesLater, "foo");

            expect(goodEarlyVerification).to.be.true;
            expect(goodLateVerification).to.be.true;
        });

    });

    describe("#verifyEvent", () => {
        it('pulls verification information from the API Gateway event', function () {
            const now: number = new Date().getTime() / 1000;
            const fourMinutesEarlier = now - 240;

            const goodEarlyVerification = requestVerifier.verifyEvent({
                body: "foo",
                path: "any",
                queryStringParameters: null,
                headers: {
                    "X-Slack-Signature": getSignatureOfFoo(fourMinutesEarlier),
                    "X-Slack-Request-Timestamp": fourMinutesEarlier
                }
            });

            expect(goodEarlyVerification).to.be.true;
        });
    });

});

function getSignatureOfFoo(timestamp: number) {
    return "v0=" + crypto.createHmac('sha256', "testSecret").update(`v0:${timestamp}:foo`).digest('hex');
}