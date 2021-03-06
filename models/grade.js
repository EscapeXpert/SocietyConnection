const Sequelize = require('sequelize');

module.exports = class Grade extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Grade',
            tableName: 'grade',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate(db) {
        db.Grade.hasMany(db.User, {foreignKey: 'grade_id', sourceKey: 'id'})
    }
};