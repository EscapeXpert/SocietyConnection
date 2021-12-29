const Sequelize = require('sequelize');

module.exports = class Like extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            user_id: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            post_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        }, {
            sequelize,
            //timestamps: true,
            underscored: true,
            modelName: 'Like',
            tableName: 'likes',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

};