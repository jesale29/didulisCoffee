const pool = require('../config/db');

/**
 * Base Model Class
 * Handles database interaction for all child models (Order, Inventory, User).
 */
class Model {
    /**
     * @param {string} tableName - The name of the table in Postgres.
     * @param {string} resourceType - The tag for activity logging (e.g., 'ORDER', 'INVENTORY').
     */
    constructor(tableName, resourceType = 'GENERAL') {
        this.table = tableName;
        this.resourceType = resourceType;
        this.attributes = {};
    }

    static managedInstance(data) {
        if (!data) return null;
        const instance = new this();
        instance.attributes = data;
        // Proxy attributes so you can do order.id instead of order.attributes.id
        return new Proxy(instance, {
            get(target, prop) {
                return prop in target ? target[prop] : target.attributes[prop];
            }
        });
    }

    /**
     * GET ALL: Fetches only non-archived records.
     */
    async all() {
        const query = `
            SELECT * FROM ${this.table} 
            WHERE deleted_at IS NULL 
            ORDER BY created_at DESC`;
        const { rows } = await pool.query(query);
        return rows;
    }

    /**
     * FIND BY ID: Fetches a single record if it hasn't been soft-deleted.
     */
    async find(id) {
        const query = `
            SELECT * FROM ${this.table} 
            WHERE id = $1 AND deleted_at IS NULL`;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * CREATE: Dynamic column insertion.
     */
    async create(payload) {
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        
        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO ${this.table} (${columns}) 
            VALUES (${placeholders}) 
            RETURNING *`;

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (err) {
            console.error(`❌ DB Create Error [${this.table}]:`, err.message);
            throw err;
        }
    }
    
    /**
     * UPDATE: Dynamic column updates with automatic timestamping.
     */
    async update(id, payload) {
        const keys = Object.keys(payload);
        const values = Object.values(payload);

        if (keys.length === 0) return null;

        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const query = `
            UPDATE ${this.table} 
            SET ${setClause}, updated_at = NOW() 
            WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
            RETURNING *`;

        try {
            const { rows } = await pool.query(query, [...values, id]);
            return rows[0];
        } catch (err) {
            console.error(`❌ DB Update Error [${this.table}]:`, err.message);
            throw err;
        }
    }

    /**
     * HARD DELETE: Physical removal (Use with caution).
     */
    async delete(id) {
        const query = `DELETE FROM ${this.table} WHERE id = $1`;
        await pool.query(query, [id]);
        return true;
    }

    /**
     * GLOBAL ACTIVITY TRACKER
     * Records changes into the activity_logs table for audit purposes.
     */
    async logActivity({ userId, resourceId, actionType, oldData = {}, newData = {}, description = '' }) {
        const query = `
            INSERT INTO activity_logs 
            (user_id, resource_type, resource_id, action_type, old_data, new_data, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        try {
            await pool.query(query, [
                userId, 
                this.resourceType, 
                resourceId, 
                actionType, 
                JSON.stringify(oldData), 
                JSON.stringify(newData), 
                description
            ]);
        } catch (err) {
            console.error(`❌ Global Logger Error [${this.resourceType}]:`, err.message);
            // Log failure doesn't throw, allowing main action to finish
        }
    }

    /**
     * ARCHIVE RESOURCE (Transaction-Safe Soft Delete)
     * Handles the 'deleted_at' flag and logs the event in one go.
     */
    async archive(id, userId, customNotes = '') {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Fetch current state before "deletion"
            const oldData = await this.find(id);
            if (!oldData) throw new Error(`${this.resourceType} not found.`);

            // 2. Mark as deleted
            const { rows } = await client.query(
                `UPDATE ${this.table} SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
                [id]
            );
            const newData = rows[0];

            // 3. Trigger Global Log
            await this.logActivity({
                userId,
                resourceId: id,
                actionType: 'ARCHIVE',
                oldData,
                newData,
                description: customNotes || `${this.resourceType} was archived by user.`
            });

            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`❌ Archive Error [${this.table}]:`, err.message);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * RAW QUERY WRAPPER
     * Use this in child models for complex JOINs.
     */
    async query(text, params) {
        return await pool.query(text, params);
    }

    /**
     * Eloquent: belongsTo
     */
    async belongsTo(RelatedModel, foreignKey) {
        const id = this.attributes[foreignKey];
        if (!id) return null;
        return await RelatedModel.find(id);
    }

    /**
     * Eloquent: hasMany
     */
    async hasMany(RelatedModel, foreignKey) {
        const query = `SELECT * FROM ${RelatedModel.table} WHERE ${foreignKey} = $1 AND deleted_at IS NULL`;
        const { rows } = await pool.query(query, [this.attributes.id]);
        return rows.map(row => RelatedModel.constructor.managedInstance(row));
    }

    /**
     * Static Find (Entry Point)
     */
    static async find(id) {
        const tableName = new this().table;
        const query = `SELECT * FROM ${tableName} WHERE id = $1 AND deleted_at IS NULL`;
        const { rows } = await pool.query(query, [id]);
        return rows[0] ? this.managedInstance(rows[0]) : null;
    }
    
}

module.exports = Model;