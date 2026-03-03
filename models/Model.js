const pool = require('../config/db');

/**
 * Base Model Class
 * Centralizes database logic, relationships, and Proxy-based instance management.
 */
class Model {
    static tableName = ''; // Overridden by child classes
    static db = pool;      // Static reference to the PG pool

    constructor(tableName, resourceType = 'GENERAL') {
        this.table = tableName;
        this.resourceType = resourceType;
        this.attributes = {};
    }

    /**
     * CENTRAL QUERY HANDLER
     * The single point of entry for all database execution.
     */
    static async query(sql, params = []) {
        try {
            return await this.db.query(sql, params);
        } catch (err) {
            console.error(`\x1b[41m DB_ERROR [${this.tableName || 'Model'}] \x1b[0m`, err.message);
            throw err;
        }
    }

    /**
     * Instance-level alias for the central query handler
     */
    async query(sql, params = []) {
        return await this.constructor.query(sql, params);
    }

    /**
     * ELOQUENT PROXY WRAPPER
     * Binds methods to the instance and allows direct access to attributes.
     */
    static managedInstance(data) {
        if (!data) return null;
        const instance = new this();
        
        // Use spread operator to avoid DEP0060
        instance.attributes = { ...data }; 
        
        return new Proxy(instance, {
            get(target, prop) {
                // 1. Check if the property is a function (e.g., belongsTo, userRole)
                const value = Reflect.get(target, prop);
                if (typeof value === 'function') {
                    // We bind the function to the instance so 'this' works correctly
                    return value.bind(target);
                }
                
                // 2. If it's not on the target, check attributes
                if (!(prop in target) && prop in target.attributes) {
                    return target.attributes[prop];
                }
                
                return value;
            },
            set(target, prop, value) {
                // Determine if we are setting a class property or a data attribute
                if (prop in target) {
                    target[prop] = value;
                } else {
                    target.attributes[prop] = value;
                }
                return true;
            }
        });
    }

    // --- STATIC READ METHODS ---

    static async all() {
        const sql = `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY created_at DESC`;
        const { rows } = await this.query(sql);
        return rows.map(row => this.managedInstance(row));
    }

    static async find(id) {
        if (!id) return null;
        const sql = `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`;
        const { rows } = await this.query(sql, [id]);
        return rows[0] ? this.managedInstance(rows[0]) : null;
    }

    static async where(column, value) {
        const sql = `SELECT * FROM ${this.tableName} WHERE ${column} = $1 AND deleted_at IS NULL ORDER BY created_at DESC`;
        const { rows } = await this.query(sql, [value]);
        return rows.map(row => this.managedInstance(row));
    }

    static async count() {
        const sql = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE deleted_at IS NULL`;
        const { rows } = await this.query(sql);
        return parseInt(rows[0].total, 10);
    }

    // --- INSTANCE PERSISTENCE METHODS ---

    async save() {
        // Exclude internal timestamps and ID from the automatic mapping
        const fields = Object.keys(this.attributes).filter(key => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(key));
        const values = fields.map(field => this.attributes[field]);

        if (this.attributes.id) {
            // UPDATE logic
            const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
            const sql = `UPDATE ${this.table} SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
            const { rows } = await this.query(sql, [...values, this.attributes.id]);
            this.attributes = { ...rows[0] };
        } else {
            // INSERT logic
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
            const sql = `INSERT INTO ${this.table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await this.query(sql, values);
            this.attributes = { ...rows[0] };
        }
        return this;
    }

    async delete() {
        if (!this.attributes.id) return false;
        const sql = `UPDATE ${this.table} SET deleted_at = NOW() WHERE id = $1`;
        await this.query(sql, [this.attributes.id]);
        return true;
    }

    // --- FULL ELOQUENT RELATIONSHIPS ---

    async belongsTo(RelatedModel, foreignKey) {
        const id = this.attributes[foreignKey];
        if (!id) return null;
        return await RelatedModel.find(id);
    }

    async hasOne(RelatedModel, foreignKey) {
        const sql = `SELECT * FROM ${RelatedModel.tableName} WHERE ${foreignKey} = $1 AND deleted_at IS NULL LIMIT 1`;
        const { rows } = await this.query(sql, [this.attributes.id]);
        return rows[0] ? RelatedModel.managedInstance(rows[0]) : null;
    }

    async hasMany(RelatedModel, foreignKey) {
        return await RelatedModel.where(foreignKey, this.attributes.id);
    }

    async belongsToMany(RelatedModel, pivotTable, foreignKey, relatedKey) {
        const sql = `
            SELECT r.* FROM ${RelatedModel.tableName} r
            JOIN ${pivotTable} p ON r.id = p.${relatedKey}
            WHERE p.${foreignKey} = $1 AND r.deleted_at IS NULL
        `;
        const { rows } = await this.query(sql, [this.attributes.id]);
        return rows.map(row => RelatedModel.managedInstance(row));
    }

    async hasManyThrough(TargetModel, IntermediateModel, firstKey, secondKey) {
        const sql = `
            SELECT t.* FROM ${TargetModel.tableName} t
            JOIN ${IntermediateModel.tableName} i ON t.${secondKey} = i.id
            WHERE i.${firstKey} = $1 AND t.deleted_at IS NULL
        `;
        const { rows } = await this.query(sql, [this.attributes.id]);
        return rows.map(row => TargetModel.managedInstance(row));
    }
}

module.exports = Model;