const Sequelize = require('sequelize');

module.exports = class PostFile extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            file_path: {
                type: Sequelize.STRING(200),
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: true,
            modelName: 'PostFile',
            tableName: 'post_file',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.PostFile.belongsTo(db.Post, { foreignKey: 'post_id', targetKey: 'id', onDelete: 'cascade'});
        db.PostFile.belongsTo(db.Board, { foreignKey: 'board_id', targetKey: 'id', onDelete: 'cascade'});
    }

};
