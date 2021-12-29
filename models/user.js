const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            id: {
                type: Sequelize.STRING(30),
                allowNull: false,
                primaryKey: true,
            },
            password: {
                type: Sequelize.STRING(15),
                allowNull: true,
            },
            sns_id: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
            login_type: {
                type: Sequelize.STRING(15),
                allowNull: false,
                defaultValue: 'local',
            },
            name: {
              type: Sequelize.STRING(15),
              allowNull: false
            },
            introduce: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
            profile_image: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            grade: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'User',
            tableName: 'user',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.User.hasMany(db.Message, { foreignKey: 'sender_id', sourceKey: 'id'});
        db.User.hasMany(db.Message, { foreignKey: 'receiver_id', sourceKey: 'id'});
        db.User.hasMany(db.Comment, { foreignKey: 'creator_id', sourceKey: 'id'});
        db.User.hasMany(db.Post, { foreignKey: 'creator_id', sourceKey: 'id'});
        db.User.hasMany(db.ReplyComment, { foreignKey: 'creator_id', sourceKey: 'id'});
        db.User.hasMany(db.Applicant, { foreignKey: 'user_id', sourceKey: 'id'});
        db.User.hasMany(db.Recruitment, { foreignKey: 'creator_id', sourceKey: 'id'});
        db.User.belongsToMany(db.Post, {
            foreignKey: 'user_id',
            through: 'Like',
        });
    }
};