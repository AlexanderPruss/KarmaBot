import {EventData, EventHandler, IncomingSlackEvent} from "./EventHandler";
import {RequestVerifier} from "./RequestVerifier";
import {expect} from "chai";
import {KarmaUpdateHandler} from "../karma/KarmaUpdateHandler";
import {OAuthService} from "../oauth/OAuthService";
import {TeamAuthToken} from "../oauth/TeamAuthToken";
import {AuthRequest} from "../oauth/AuthRequest";

describe("EventHandler", () => {

    describe("#handleAPIGatewayEvent", () => {

        it('returns a 403 if verification fails ', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            verifier.verifyEvent = () => {
                return false
            };
            handler.requestVerifier = verifier;

            const response = await handler.handleApiGatewayEvent(null);

            expect(response).to.eql({
                statusCode: 403,
                isBase64Encoded: false,
                body: "Unauthorized"
            });
        });

        it('answers with a challenge if a challenge is present in the request body', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            verifier.verifyEvent = () => {
                return true
            };
            handler.requestVerifier = verifier;

            const response = await handler.handleApiGatewayEvent({
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

        it('returns a 401 if the slack event is malformed', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            verifier.verifyEvent = () => {
                return true
            };
            handler.requestVerifier = verifier;
            const event: IncomingSlackEvent = {
                team_id: "TeamOne",
                event: null
            };

            const response = await handler.handleApiGatewayEvent({
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

        it('writes an auth token if the path matches', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            const authService = new OAuthService();
            verifier.verifyEvent = () => {
                return true
            };
            handler.requestVerifier = verifier;
            handler.authService = authService;
            authService.authorizeTeam = async (authRequest) => {
                if(authRequest.code != "1234") {
                    throw new Error("Expected a different code.");
                }
            };
            const event: AuthRequest = {
                code: "1234"
            };

            const response = await handler.handleApiGatewayEvent({
                headers: null,
                path: "auth",
                body: JSON.stringify(event)
            });

            expect(response).to.eql({
                statusCode: 200,
                isBase64Encoded: false,
                body: "Authorization successful"
            });
        });

        it('returns an error if writing an auth token fails', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            const authService = new OAuthService();
            verifier.verifyEvent = () => {
                return true
            };
            handler.requestVerifier = verifier;
            handler.authService = authService;
            authService.authorizeTeam = async (authRequest) => {
                if(authRequest.code != "1235") {
                    throw new Error("Expected a different code.");
                }
            };
            const event: AuthRequest = {
                code: "1234"
            };

            const response = await handler.handleApiGatewayEvent({
                headers: null,
                path: "auth",
                body: JSON.stringify(event)
            });

            expect(response).to.eql({
                statusCode: 403,
                isBase64Encoded: false,
                body: "Unauthorized"
            });
        });

        it('passes events on to all handlers and returns a 200', async function () {
            const handler = new EventHandler();
            const verifier = new RequestVerifier();
            const authService = new OAuthService();
            const karmaUpdateHandler = new KarmaUpdateHandler();
            let inputEvent: EventData = null;
            handler.requestVerifier = verifier;
            handler.karmaUpdateHandler = karmaUpdateHandler;
            handler.authService = authService;
            verifier.verifyEvent = () => {
                return true
            };
            karmaUpdateHandler.handleEvent = async (event, token) => {
                if(token.team_id == "TeamOne"){
                    inputEvent = event;
                }
            };
            const token = new TeamAuthToken();
            token.team_id = "TeamOne";
            authService.getTeamToken = async (teamId) => {
                if(teamId == "TeamOne") {
                    return token;
                }
            };


            const innerEvent: EventData = {
                text: "hello",
                channel: "there"
            };
            const event: IncomingSlackEvent = {
                team_id: "TeamOne",
                event: innerEvent
            };

            const response = await handler.handleApiGatewayEvent({
                headers: null,
                path: null,
                body: JSON.stringify(event)
            });

            expect(response).to.eql({
                statusCode: 200,
                isBase64Encoded: false,
                body: "Event processing."
            });
            expect(innerEvent).to.eql(innerEvent);
        });
    });

});