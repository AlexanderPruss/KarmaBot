import * as Koa from 'koa';
import * as bodyParser from "koa-bodyparser";

class App {
    public koa = new Koa();

    constructor() {
        this.koa.use(bodyParser());
    }
}

export default new App().koa
