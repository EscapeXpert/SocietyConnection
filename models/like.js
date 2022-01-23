const Sequelize = require("sequelize");
module.exports = class Like extends Sequelize.Model {
    static init(sequelize) {
        return super.init({}, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Like',
            tableName: 'like',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Like.belongsTo(db.Board, {foreignKey: 'board_id', targetKey: 'id', onDelete: 'cascade'});
        db.Like.belongsTo(db.Post, {foreignKey: 'post_id', targetKey: 'id', onDelete: 'cascade'});
        db.Like.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'id', onDelete: 'no action'});
    }
};