const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            content: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Comment',
            tableName: 'comment',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Comment.belongsTo(db.User, { foreignKey: 'creator_id', targetKey: 'id', onDelete: 'no action'});
        db.Comment.belongsTo(db.Post, { foreignKey: 'post_id', targetKey: 'id', onDelete: 'cascade'});
        db.Comment.hasMany(db.ReplyComment, {foreignKey: 'comment_id', sourceKey: 'id', onDelete: 'cascade'});
    }
};
