import * as Koa from 'koa';
import appRouter from "./router/AppRouter";
import * as bodyParser from "koa-bodyparser";

class App {
    public koa = new Koa();

    constructor() {
        this.koa.use(bodyParser());
        this.koa.use();
        this.mountRoutes();
    }

    private mountRoutes(): void {
        let router = appRouter.setupRoutes();
        this.koa
            .use(router.routes())
            .use(router.allowedMethods());
    }
}

export default new App().koa
