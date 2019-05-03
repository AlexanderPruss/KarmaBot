import eventHandler from "./events/EventHandler";

exports.handler = async (event, context) => {
    return eventHandler.handleApiGatewayEvent(event);
};