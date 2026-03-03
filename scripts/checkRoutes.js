/**
 * Route Verification Script
 * Run this to see all named routes currently in the Registry.
 */
const { registry } = require('../routes/registry');

// 1. Manually require your route files to trigger registration
// If these aren't required, the Registry stays empty!
try {
    require('../routes/authRoutes');
    require('../routes/adminRoutes');
    require('../routes/publicRoutes');
    // Add any other route files here...
} catch (err) {
    console.warn("⚠️ Note: Some route files couldn't be loaded. Ensure they don't execute logic on load.");
}

console.log("\n--- 📍 REGISTERED ROUTES 📍 ---");

const routeNames = Object.keys(registry.routes);

if (routeNames.length === 0) {
    console.log("❌ No routes found in registry. Check if RouteWrapper is being called.");
} else {
    // Format for console.table
    const tableData = routeNames.map(name => {
        const target = registry.routes[name];
        return {
            'Route Name': name,
            'Path / Resolver': typeof target === 'function' ? '[Dynamic Function]' : target
        };
    });

    console.table(tableData);
}

console.log(`\nTotal Routes: ${routeNames.length}\n`);