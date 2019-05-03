import {EventData, EventHandler, IncomingSlackEvent} from "./EventHandler";
import {RequestVerifier} from "./RequestVerifier";
import {expect} from "chai";
import {KarmaUpdateHandler} from "../karma/KarmaUpdateHandler";

describe("EventHandler", () => {

    describe("#handleAPIGatewayEvent", () => {

        it('returns a 403 if verification fails ', function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            verifier.verifyEvent = () => {return false};
            handler.requestVerifier = verifier;

            const response = handler.handleApiGatewayEvent(null);

            expect(response).to.eql({
                statusCode: 403,
                isBase64Encoded: false,
                body: "Unauthorized"
            });
        });

        it('answers with a challenge if a challenge is present in the request body', function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            verifier.verifyEvent = () => {return true};
            handler.requestVerifier = verifier;

            const response = handler.handleApiGatewayEvent({
                headers: null,
                path: null,
                body: "{\"challenge\": \"fizzbuzz\"}"
            });

            expect(response).to.eql({
                statusCode: 200,
                isBase64Encoded: false,
                body: "fizzbuzz"
            });
        });

        it('returns a 401 if the slack event is malformed', function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            verifier.verifyEvent = () => {return true};
            handler.requestVerifier = verifier;
            const event: IncomingSlackEvent = {
              event: null
            };

            const response = handler.handleApiGatewayEvent({
                headers: null,
                path: null,
                body: JSON.stringify(event)
            });

            expect(response).to.eql({
                statusCode: 401,
                isBase64Encoded: false,
                body: "Couldn't parse slack event."
            });
        });

        it('passes events on to all handlers and returns a 200', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            const karmaUpdateHandler = new KarmaUpdateHandler();
            let inputEvent: EventData = null;
            handler.requestVerifier = verifier;
            handler.karmaUpdateHandler = karmaUpdateHandler;
            verifier.verifyEvent = () => {return true};
            karmaUpdateHandler.handleEvent = async (event) => {
                inputEvent = event;
            };

            const innerEvent: EventData = {
                text: "hello",
                    channel: "there"
            };
            const event: IncomingSlackEvent = {
                event: innerEvent
            };

            const response = handler.handleApiGatewayEvent({
                headers: null,
                path: null,
                body: JSON.stringify(event)
            });

            expect(response).to.eql({
                statusCode: 200,
                isBase64Encoded: false,
                body: "Event processing."
            });
            await delay(500);
            expect(innerEvent).to.eql(innerEvent);
        });
    });

});

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}