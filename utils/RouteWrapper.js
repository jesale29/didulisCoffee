const { registry } = require('../routes/registry'); // Change this line

class RouteWrapper {
    constructor(router, prefix = '', namePrefix = '') {
        this.router = router;
        this.prefix = prefix;
        this.namePrefix = namePrefix;
    }

    _register(name, path) {
        // Clean up double slashes (e.g., //admin//dashboard -> /admin/dashboard)
        const fullPath = (this.prefix + '/' + path).replace(/\/+/g, '/');
        const fullName = this.namePrefix ? `${this.namePrefix}.${name}` : name;

        if (path.includes(':')) {
            registry.routes[fullName] = (params) => {
                let url = fullPath;
                for (const key in params) {
                    url = url.replace(`:${key}`, params[key]);
                }
                return url;
            };
        } else {
            registry.routes[fullName] = fullPath;
        }
        
        // DEBUG: Uncomment this to see routes loading in terminal
        //console.log(`Registered: [${fullName}] -> ${fullPath}`);
    }

    get(path, handler) {
        this.router.get(path, handler);
        return { name: (n) => this._register(n, path) };
    }

    post(path, handler) {
        this.router.post(path, handler);
        return { name: (n) => this._register(n, path) };
    }
}


module.exports = (router, prefix, namePrefix) => new RouteWrapper(router, prefix, namePrefix);