const BaseController = require('./BaseController');
const Session = require('../models/Session');     // Use our new Model
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const User = require('../models/User');

class AdminController extends BaseController {
    constructor() {
        super();
    }

    /**
     * Staff Dashboard Handler
     * Aggregates system-wide statistics for the admin overview.
     */
    dashboard = async (req, res) => {
        try {
            // 1. Fetch data in parallel for better performance
            const [activeUsers, inventoryCount, recentOrders, allUsers] = await Promise.all([
                Session.getActiveCount(),
                Inventory.count(),
                Order.getRecentWithUsers(5),
                User.all()
            ]);

            // 2. Prepare the view data
            const viewData = {
                title: 'Staff Dashboard',
                activePage: 'dashboard',
                activeUsers, // Direct count from Session model
                stats: {
                    inventory: inventoryCount,
                    orderCount: recentOrders.length,
                    userCount: allUsers.length
                },
                orders: recentOrders // Passed for the table iteration
            };

            // 3. Render using the BaseController logic and 'admin' layout
            return this.render(res, 'admin/dashboard', viewData, 'admin');
            
        } catch (error) {
            // Use the standardized error renderer instead of a raw .send()
            return this.renderError(req, res, error);
        }
    }
}

// Export as a singleton
module.exports = new AdminController();