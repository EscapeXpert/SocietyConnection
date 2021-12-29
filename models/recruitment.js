const Sequelize = require('sequelize');

module.exports = class Recruitment extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            view_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            deadline: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            is_complete: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            board_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: true,
            modelName: 'Recruitment',
            tableName: 'recruitments',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Recruitment.hasMany(db.Applicant, { foreignKey: 'recruitment_id', sourceKey: 'id'});
        db.Recruitment.belongsTo(db.User, { foreignKey: 'creator_id', targetKey: 'id'});
    }

};