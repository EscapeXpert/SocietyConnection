const Sequelize = require('sequelize');

module.exports = class Board extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            min_read_grade: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            min_write_grade: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        }, {
            sequelize,
            //timestamps: true,
            underscored: true,
            modelName: 'Board',
            tableName: 'boards',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Board.hasMany(db.Post, { foreignKey: 'board_id', sourceKey: 'id'});
    }
};
