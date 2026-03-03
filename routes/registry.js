// routes/registry.js
class RouteRegistry {
    constructor() {
        this.routes = {};
        //console.log("✅ Route Registry Initialized");
    }

    /**
     * The helper used in EJS: <%= route('name', { id: 1 }) %>
     */
    route(name, params = {}) {
        const target = this.routes[name];

        if (!target) {
            // Log this so you can see in terminal if a name is missing
            //console.warn(`⚠️ Route name "${name}" not found in registry.`);
            return '#'; 
        }

        if (typeof target === 'function') {
            return target(params);
        }

        return target;
    }
}
//console.log("--- REGISTRY LOADING ---");
const registryInstance = new RouteRegistry();
// .bind ensures 'this.routes' is never undefined
const route = registryInstance.route.bind(registryInstance);

module.exports = {
    registry: registryInstance,
    route: route
};