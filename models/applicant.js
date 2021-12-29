const Sequelize = require('sequelize');

module.exports = class Applicant extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            is_accepted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
        db.Applicant.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'id'});
        db.Applicant.belongsTo(db.Recruitment, {foreignKey: 'recruitment_id', targetKey: 'id'});
    }
};