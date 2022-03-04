const Sequelize = require('sequelize');

module.exports = class Message extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title:{
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            is_sender_delete: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            is_receiver_delete:{
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'Message',
            tableName: 'message',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Message.belongsTo(db.User, { foreignKey: 'sender_id', targetKey: 'id', onDelete: 'no action'});
        db.Message.belongsTo(db.User, { foreignKey: 'receiver_id', targetKey: 'id', onDelete: 'no action'});
    }
};
