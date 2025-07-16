/**
 * Beni.js - A minimalist SPA framework (No Animations)
 * @version 1.0.2
 * @license MIT
 */

// Router
class Router {
    constructor(options) {
        this.options = options;
        this.routes = new Map();
        this.currentRoute = null;
        this.params = {};
        this.onRouteChange = null;
    }

    route(path, handler) {
        if (path === '*') {
            this.routes.set('*', {
                handler,
                regex: null,
                originalPath: path
            });
        } else {
            const paramPattern = path.replace(/:([^/]+)/g, '(?<$1>[^/]+)');
            const regex = new RegExp(`^${paramPattern}$`);

            this.routes.set(path, {
                handler,
                regex,
                originalPath: path
            });
        }

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

    matchRoute(path) {
        for (const [routePath, route] of this.routes) {
            if (routePath === '*') continue;

            if (route.regex) {
                const match = path.match(route.regex);
                if (match) {
                    this.params = match.groups || {};
                    return route;
                }
            }
        }

        const catchAllRoute = this.routes.get('*');
        if (catchAllRoute) {
            this.params = { path };
            return catchAllRoute;
        }

        return null;
    }

    getCurrentPath() {
        if (this.options.hashRouting) {
            return window.location.hash.substring(1) || '/';
        }
        return window.location.pathname;
    }

    handleRoute() {
        const path = this.getCurrentPath();
        const route = this.matchRoute(path);

        if (route) {
            this.currentRoute = route;
            this.onRouteChange?.(route, this.params);
        } else {
            this.handle404(path);
        }
    }

    handle404(path) {
        const notFoundRoute = this.routes.get('404');
        if (notFoundRoute) {
            this.onRouteChange?.(notFoundRoute, { path });
        } else {
            const catchAllRoute = this.routes.get('*');
            if (catchAllRoute) {
                this.onRouteChange?.(catchAllRoute, { path });
            }
        }
    }

    init() {
        if (this.options.hashRouting) {
            window.addEventListener('hashchange', () => this.handleRoute());
        } else {
            window.addEventListener('popstate', () => this.handleRoute());
        }

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                this.navigate(link.getAttribute('href').substring(1));
            }
        });

        this.handleRoute();
    }
}

// State Manager
class StateManager {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
        this.onStateChange = null;
    }

    set(key, value) {
        if (this.state[key] === value) return this;

        const oldValue = this.state[key];
        this.state[key] = value;
        this.notifySubscribers(key, value, oldValue);
        this.onStateChange?.(key, value);

        return this;
    }

    get(key) {
        return this.state[key];
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }

        this.subscribers.get(key).add(callback);

        return () => this.unsubscribe(key, callback);
    }

    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).delete(callback);
        }
        return this;
    }

    notifySubscribers(key, value, oldValue) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }
    }
}

// ✅ RENDERER SEM ANIMAÇÕES
class Renderer {
    constructor(options) {
        this.options = {
            container: '#app',
            ...options
        };
        this.container = null;
        this.renderQueue = [];
        this.isRendering = false;
    }

    render(html, targetContainer) {
        const container = targetContainer || this.getContainer();

        if (!container) {
            const error = `Container "${this.options.container}" não encontrado`;
            console.error('❌', error);
            throw new Error(error);
        }

        // ✅ RENDER DIRETO - SEM ANIMAÇÕES NEM DELAYS
        this.scheduleRender(() => {
            container.innerHTML = html;
        });

        return this;
    }

    getContainer() {
        if (!this.container) {
            this.container = document.querySelector(this.options.container);
        }
        return this.container;
    }

    scheduleRender(renderFn) {
        this.renderQueue.push(renderFn);

        if (!this.isRendering) {
            this.isRendering = true;
            requestAnimationFrame(() => {
                while (this.renderQueue.length > 0) {
                    const fn = this.renderQueue.shift();
                    fn();
                }
                this.isRendering = false;
            });
        }
    }

    init() {
        this.container = document.querySelector(this.options.container);

        if (!this.container) {
            console.warn(`⚠️ Container "${this.options.container}" não encontrado no init`);
        }

        return this;
    }
}

// Main Beni class
class Beni {
    constructor(options = {}) {
        this.options = {
            container: '#app',
            hashRouting: false,
            ...options
        };

        this.router = new Router(this.options);
        this.state = new StateManager();
        this.renderer = new Renderer(this.options);

        this.setupConnections();
    }

    setupConnections() {
        this.router.onRouteChange = (route, params) => {
            try {
                route.handler(params);
            } catch (error) {
                console.error('Erro ao renderizar rota:', error);
                this.renderError(error);
            }
        };

        this.state.onStateChange = (key, value) => {
            this.updateStateElements(key, value);
        };
    }

    renderError(error) {
        try {
            this.render(`<div style="color: red; padding: 20px;">
                <h1>❌ Erro</h1>
                <p>${error.message}</p>
            </div>`);
        } catch (renderError) {
            console.error('Erro ao renderizar erro:', renderError);
        }
    }

    route(path, handler) {
        return this.router.route(path, handler);
    }

    navigate(path) {
        return this.router.navigate(path);
    }

    setState(key, value) {
        return this.state.set(key, value);
    }

    getState(key) {
        return this.state.get(key);
    }

    subscribe(key, callback) {
        return this.state.subscribe(key, callback);
    }

    render(html, container) {
        return this.renderer.render(html, container);
    }

    updateStateElements(key, value) {
        const elements = document.querySelectorAll(`[data-state="${key}"]`);
        elements.forEach(element => {
            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        });
    }

    init() {
        return new Promise((resolve, reject) => {
            const maxTries = 50;
            let tries = 0;

            const initWhenReady = () => {
                tries++;
                const container = document.querySelector(this.options.container);

                if (container) {
                    this.renderer.init();
                    this.router.init();
                    resolve(this);
                } else if (tries < maxTries) {
                    setTimeout(initWhenReady, 100);
                } else {
                    const error = `Container "${this.options.container}" não encontrado`;
                    reject(new Error(error));
                }
            };

            initWhenReady();
        });
    }
}

// Factory function
function createApp(options) {
    return new Beni(options);
}

// Exports
export { createApp, Beni };
export default createApp;

// UMD/Browser globals
if (typeof window !== 'undefined') {
    window.Beni = { createApp, Beni };
    window.createApp = createApp;
}