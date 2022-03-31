const Sequelize = require('sequelize');

module.exports = class Applicant extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            is_accepted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: "신청합니다."
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
            modelName: 'Applicant',
            tableName: 'applicant',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Applicant.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'id', onDelete: 'no action'});
        db.Applicant.belongsTo(db.Recruitment, {foreignKey: 'recruitment_id', targetKey: 'id', onDelete: 'cascade'});
    }
};