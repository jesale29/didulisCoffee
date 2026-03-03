const Model = require('./Model');
const Role = require('./Role');

class User extends Model {
    static tableName = 'users';

    constructor() {
        // Table: users, Resource Tag: USER
        super(User.tableName, 'USER');
    }

    /**
     * STATIC Find user for the Login Strategy
     * This is what Passport.js needs. It allows calling User.findByEmail() 
     * without having an existing user instance.
     */
    static async findByEmail(email) {
        const sql = `SELECT * FROM ${this.tableName} WHERE email = $1 AND deleted_at IS NULL LIMIT 1`;
        const { rows } = await this.query(sql, [email]);
        
        // Return a managed instance Proxy
        return rows[0] ? this.managedInstance(rows[0]) : null;
    }

    /**
     * Instance-level alias (Optional)
     * If you still want to call this on an instance: const u = new User(); await u.findByEmail(...)
     */
    async findByEmail(email) {
        return await this.constructor.findByEmail(email);
    }

    /**
     * Relationship: hasMany (Orders)
     */
    async orders() {
        const Order = require('./Order');
        return await this.hasMany(Order, 'user_id');
    }

    /**
     * Utility: isAdmin check
     * Note: Since this is a getter, the Proxy in Model.js handles this perfectly.
     */
    get isAdmin() {
        return this.attributes.role === 'admin' || this.role === 'admin';
    }

    /**
     * Relationship: A User belongs to a Role
     */
    async userRole() {
        return await this.belongsTo(Role, 'role_id');
    }

    /**
     * Registration Logic
     */
    async register(payload) {
        // Prepare attributes for the save/create logic in the parent Model
        this.attributes = { ...payload };
        const newUser = await this.save(); 
        
        // Log the activity if the parent Model has this method
        if (this.logActivity) {
            await this.logActivity({
                userId: newUser.id,
                resourceId: newUser.id,
                actionType: 'SIGNUP',
                newData: { email: newUser.email },
                description: `New user registered: ${newUser.email}`
            });
        }

        return newUser;
    }
}

// We export the CLASS so static methods like findByEmail work, 
// and an INSTANCE for general usage if preferred.
const userInstance = new User();

// Attach the class to the instance so you can do require('./User').findByEmail
userInstance.findByEmail = User.findByEmail.bind(User);

module.exports = User;