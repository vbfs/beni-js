export default class StateManager {
    constructor(options) {
        this.options = options;
        this.state = {};
        this.subscribers = new Map();
        this.onStateChange = null;
        this.history = [];
        this.maxHistorySize = 50;
    }

    set(key, value) {
        const oldValue = this.state[key];

        if (oldValue === value) return this;

        // Salva no histórico
        if (this.history.length >= this.maxHistorySize) {
            this.history.shift();
        }

        this.history.push({
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });

        this.state[key] = value;
        this.notifySubscribers(key, value, oldValue);
        this.onStateChange?.(key, value);

        return this;
    }

    get(key) {
        return this.state[key];
    }

    getAll() {
        return { ...this.state };
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }

        this.subscribers.get(key).add(callback);

        // Retorna função para unsubscribe
        return () => this.unsubscribe(key, callback);
    }

    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).delete(callback);

            if (this.subscribers.get(key).size === 0) {
                this.subscribers.delete(key);
            }
        }
        return this;
    }

    notifySubscribers(key, value, oldValue) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    console.error('Error in state subscriber:', error);
                }
            });
        }
    }

    // Funcionalidades avançadas
    reset(key) {
        if (key) {
            delete this.state[key];
            this.notifySubscribers(key, undefined, this.state[key]);
        } else {
            this.state = {};
            this.subscribers.forEach((callbacks, key) => {
                this.notifySubscribers(key, undefined, undefined);
            });
        }
        return this;
    }

    getHistory() {
        return [...this.history];
    }

    // Computed properties
    computed(key, computeFn, dependencies = []) {
        const compute = () => {
            const value = computeFn(this.state);
            this.set(key, value);
        };

        // Recalcula quando dependências mudarem
        dependencies.forEach(dep => {
            this.subscribe(dep, compute);
        });

        // Calcula valor inicial
        compute();

        return this;
    }

    init() {
        return this;
    }

    destroy() {
        this.state = {};
        this.subscribers.clear();
        this.history = [];
    }
}