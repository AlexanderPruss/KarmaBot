import requestVerifier from "./RequestVerifier";
import {SlackConfig} from "./SlackConfig";

import {expect} from 'chai';
import crypto = require("crypto");

let testConfig = new SlackConfig();
testConfig.signingSecret = "testSecret";
requestVerifier.config = testConfig;

function getSignatureOfFoo(timestamp: number) {
    return "v0=" + crypto.createHmac('sha256', "testSecret").update(`v0:${timestamp}:foo`).digest('hex');
}

describe("RequestVerifier", () => {

    describe("#checkSignature", () => {

        it("returns false if the timestamp is null or undefined", () => {
            const nullTimestamp = requestVerifier.checkSignature(getSignatureOfFoo(null), null, "foo");
            const undefinedTimestamp = requestVerifier.checkSignature(getSignatureOfFoo(undefined), undefined, "foo");

            expect(nullTimestamp).to.be.false;
            expect(undefinedTimestamp).to.be.false;
        });

        it("returns false if the timestamp is more than five minutes out of date", () => {
            let now: number = new Date().getTime() / 1000;
            let fiveMinutesEarlier = now - 301;
            let fiveMinutesLater = now + 301;

            const tooEarly = requestVerifier.checkSignature(getSignatureOfFoo(fiveMinutesLater), fiveMinutesEarlier, "foo");
            const tooLate = requestVerifier.checkSignature(getSignatureOfFoo(fiveMinutesLater), fiveMinutesLater, "foo");

            expect(tooEarly).to.be.false;
            expect(tooLate).to.be.false;

        });

        it("returns false if the computed signatures don't match", () => {
            let now: number = new Date().getTime() / 1000;

            const badSignature = requestVerifier.checkSignature("nonsense", now, "foo");

            expect(badSignature).to.be.false;
        });

        it("returns true if the signatures match and the timestamp is about right", () => {
            let now: number = new Date().getTime() / 1000;
            let fourMinutesEarlier = now - 240;
            let fourMinutesLater = now + 240;

            const goodEarlyVerification = requestVerifier.checkSignature(getSignatureOfFoo(fourMinutesEarlier), fourMinutesEarlier, "foo");
            const goodLateVerification = requestVerifier.checkSignature(getSignatureOfFoo(fourMinutesLater), fourMinutesLater, "foo");

            expect(goodEarlyVerification).to.be.true;
            expect(goodLateVerification).to.be.true;
        });

    });

    describe("#requestVerifier middleware", () => {
        //TODO: Going to take a look at how to do tests with Koa elements later.
    });

});