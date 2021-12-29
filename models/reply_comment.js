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
            },
            creator_id: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            comment_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
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



};
