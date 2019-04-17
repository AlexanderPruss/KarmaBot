import * as Router from 'koa-router';
import eventRouter from "../events/EventRouter";

/**
 * AppRouter puts all the routes from the subcomponents together and allows for centralized
 * router configuration.
 */
class AppRouter {

    public setupRoutes(): Router {
        let router = new Router();
        router = eventRouter.addRoutes(router);
        return router;
    }
}

export default new AppRouter()
