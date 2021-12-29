const Sequelize = require('sequelize');

module.exports = class Reply_comment extends Sequelize.Model {
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
            timestamps: true,
            underscored: true,
            modelName: 'Reply_comment',
            tableName: 'reply_comments',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Reply_comment.belongsTo(db.User, { foreignKey: 'creator_id', sourceKey: 'id'});
        db.Reply_comment.belongsTo(db.Comment, {foreignKey: 'comment_id', sourceKey: 'id'});
    }
};
