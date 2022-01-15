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
            board_type: {
                type: Sequelize.STRING(15),
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Board',
            tableName: 'board',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Board.hasMany(db.Post, { foreignKey: 'board_id', sourceKey: 'id'});
        db.Board.hasMany(db.Comment, {foreignKey: 'board_id', sourceKey: 'id'});
        db.Board.hasMany(db.Like, {foreignKey: 'board_id', sourceKey: 'id'});
        db.Board.hasMany(db.PostFile, {foreignKey: 'board_id', sourceKey: 'id'});
    }
};
