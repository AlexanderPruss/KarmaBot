import eventHandler from "./events/EventHandler";

exports.handler = (event, context) => {
    return eventHandler.handleApiGatewayEvent(event);
};