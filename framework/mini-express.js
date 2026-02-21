const http = require('http');
const url = require('url');
const EventEmitter = require('events');

class MiniExpress extends EventEmitter {
    constructor() {
        super();
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            PATCH: {},
            DELETE: {}
        };
        this.middlewares = [];
        this.errorHandlers = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    get(path, handler) {
        this.routes.GET[path] = handler;
    }

    post(path, handler) {
        this.routes.POST[path] = handler;
    }

    put(path, handler) {
        this.routes.PUT[path] = handler;
    }

    patch(path, handler) {
        this.routes.PATCH[path] = handler;
    }

    delete(path, handler) {
        this.routes.DELETE[path] = handler;
    }


    error(handler) {
        this.errorHandlers.push(handler);
    }


    createServer() {
        return http.createServer(async (req, res) => {
            try {
                const parsedUrl = url.parse(req.url, true);
                req.query = parsedUrl.query;
                req.pathname = parsedUrl.pathname;
                req.params = {};


                const routePath = this.matchRoute(req.method, req.pathname);
                if (routePath) {
                    req.params = routePath.params;
                }


                this.enhanceResponse(res);

                await this.runMiddlewares(req, res);

                if (res.writableEnded) return;


                const method = req.method;
                const path = routePath ? routePath.path : req.pathname;
                const handler = this.routes[method]?.[path];

                if (handler) {
                    await handler(req, res);
                } else {
                    res.status(404).json({ error: 'Маршрут не найден' });
                }
            } catch (err) {

                await this.handleError(err, req, res);
            }
        });
    }

    listen(port, callback) {
        const server = this.createServer();
        server.listen(port, callback);
        return server;
    }

    matchRoute(method, pathname) {
        const routes = Object.keys(this.routes[method] || {});
        
        for (const route of routes) {
            if (!route.includes(':')) continue;

            const routeParts = route.split('/');
            const pathParts = pathname.split('/');

            if (routeParts.length !== pathParts.length) continue;

            const params = {};
            let match = true;

            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    const paramName = routeParts[i].substring(1);
                    params[paramName] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { path: route, params };
            }
        }
        return null;
    }

    async runMiddlewares(req, res) {
        let index = 0;

        const next = async () => {
            if (res.writableEnded) return;
            
            const middleware = this.middlewares[index++];
            if (middleware) {
                await middleware(req, res, next);
            }
        };

        await next();
    }

    enhanceResponse(res) {
        res.status = function(code) {
            this.statusCode = code;
            return this;
        };

        res.send = function(data) {
            if (!this.writableEnded) {
                if (typeof data === 'object') {
                    this.setHeader('Content-Type', 'application/json');
                    this.end(JSON.stringify(data));
                } else {
                    this.setHeader('Content-Type', 'text/plain');
                    this.end(String(data));
                }
            }
            return this;
        };

        res.json = function(data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
            return this;
        };
    }

    async handleError(err, req, res) {
        console.error('Ошибка:', err);

        for (const handler of this.errorHandlers) {
            await handler(err, req, res);
            if (res.writableEnded) return;
        }

        if (!res.writableEnded) {
            res.status(500).json({ 
                error: 'Внутренняя ошибка сервера',
                message: err.message 
            });
        }
    }
}

module.exports = MiniExpress;