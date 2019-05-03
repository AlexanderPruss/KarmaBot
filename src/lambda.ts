import eventHandler from "./events/EventHandler";

exports.handler = async (event, context) => {
    return await eventHandler.handleApiGatewayEvent(event);
};