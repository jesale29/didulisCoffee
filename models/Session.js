const Model = require('./Model');

class Session extends Model {
    static tableName = 'session'; // Default table name for connect-pg-simple

    constructor() {
        super(Session.tableName, 'SESSION');
    }

    /**
     * Get Active Sessions
     * Useful for an Admin Dashboard "Online Now" widget.
     */
    static async getActiveCount() {
        const sql = `SELECT COUNT(*) as active FROM ${this.tableName} WHERE expire > NOW()`;
        const { rows } = await this.query(sql);
        return parseInt(rows[0].active, 10);
    }

    /**
     * Force Logout
     * Deletes a session by its ID (sid)
     */
    static async destroySession(sid) {
        const sql = `DELETE FROM ${this.tableName} WHERE sid = $1`;
        await this.query(sql, [sid]);
        return true;
    }
}

module.exports = Session;