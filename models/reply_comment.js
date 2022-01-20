const Sequelize = require('sequelize');

module.exports = class ReplyComment extends Sequelize.Model {
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
            modelName: 'ReplyComment',
            tableName: 'reply_comment',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.ReplyComment.belongsTo(db.User, { foreignKey: 'creator_id', sourceKey: 'id', onDelete: 'no action'});
        db.ReplyComment.belongsTo(db.Comment, {foreignKey: 'comment_id', sourceKey: 'id', onDelete: 'cascade'});
    }
};
