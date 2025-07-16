export default class Router {
    constructor(options) {
        this.options = options;
        this.routes = new Map();
        this.middlewares = [];
        this.currentRoute = null;
        this.params = {};
        this.onRouteChange = null;

        this.boundHandleRoute = this.handleRoute.bind(this);
        this.boundHandleClick = this.handleClick.bind(this);
    }

    route(path, handler) {
        // Suporte a parâmetros dinâmicos: /user/:id
        const paramPattern = path.replace(/:([^/]+)/g, '(?<$1>[^/]+)');
        const regex = new RegExp(`^${paramPattern}$`);

        this.routes.set(path, {
            handler,
            regex,
            originalPath: path
        });

        return this;
    }

    middleware(fn) {
        this.middlewares.push(fn);
        return this;
    }

    navigate(path) {
        if (this.options.hashRouting) {
            window.location.hash = path;
        } else {
            history.pushState({}, '', path);
            this.handleRoute();
        }
        return this;
    }

    handleRoute() {
        const path = this.getCurrentPath();
        const route = this.matchRoute(path);

        if (route) {
            // Executa middlewares
            const context = { path, params: this.params, route };

            for (const middleware of this.middlewares) {
                if (middleware(context) === false) {
                    return; // Middleware bloqueou a rota
                }
            }

            this.currentRoute = route;
            this.onRouteChange?.(route, this.params);
        } else {
            this.handle404(path);
        }
    }

    matchRoute(path) {
        for (const [routePath, route] of this.routes) {
            const match = path.match(route.regex);
            if (match) {
                this.params = match.groups || {};
                return route;
            }
        }
        return null;
    }

    getCurrentPath() {
        if (this.options.hashRouting) {
            return window.location.hash.substring(1) || '/';
        }
        return window.location.pathname;
    }

    handleClick(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        if (this.options.hashRouting && href.startsWith('#')) {
            e.preventDefault();
            this.navigate(href.substring(1));
        } else if (!this.options.hashRouting && href.startsWith('/')) {
            e.preventDefault();
            this.navigate(href);
        }
    }

    handle404(path) {
        const notFoundRoute = this.routes.get('*') || this.routes.get('404');
        if (notFoundRoute) {
            this.onRouteChange?.(notFoundRoute, { path });
        }
    }

    init() {
        if (this.options.hashRouting) {
            window.addEventListener('hashchange', this.boundHandleRoute);
        } else {
            window.addEventListener('popstate', this.boundHandleRoute);
        }

        document.addEventListener('click', this.boundHandleClick);

        // Rota inicial
        this.handleRoute();
    }

    destroy() {
        if (this.options.hashRouting) {
            window.removeEventListener('hashchange', this.boundHandleRoute);
        } else {
            window.removeEventListener('popstate', this.boundHandleRoute);
        }

        document.removeEventListener('click', this.boundHandleClick);

        this.routes.clear();
        this.middlewares = [];
    }
}