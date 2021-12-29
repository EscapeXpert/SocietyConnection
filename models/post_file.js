const Sequelize = require('sequelize');

module.exports = class Post_file extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            file_path: {
                type: Sequelize.STRING(200),
                allowNull: false,
            }
        }, {
            sequelize,
            //timestamps: true,
            underscored: true,
            modelName: 'Post_file',
            tableName: 'post_files',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Post_file.belongsTo(db.Post, { foreignKey: 'post_id', targetKey: 'id'});
    }

};
