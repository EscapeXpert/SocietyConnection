const Sequelize = require('sequelize');

module.exports = class Message extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            message: {
                type: Sequelize.STRING(100),
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
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Message',
            tableName: 'messages',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Message.belongsTo(db.User, { foreignKey: 'sender_id', targetKey: 'id'});
        db.Message.belongsTo(db.User, { foreignKey: 'receiver_id', targetKey: 'id'});
    }
};
