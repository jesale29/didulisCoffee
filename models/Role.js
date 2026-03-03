const Model = require('./Model');
const User = require('./User');

class Role extends Model {
    static tableName = 'roles';

    constructor() {
        super('roles', 'ROLE');
    }

    async user(){
        return await this.hasMany(User, 'role')
    }
}

module.exports = Role;