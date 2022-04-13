require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: 'escapexpert',
        database: 'societyconnection',
        host: '127.0.0.1',
        dialect: 'mysql',
        timezone: 'Asia/Seoul'
    },
    test: {
        username: 'root',
        password: 'escapexpert',
        database: 'societyconnection_test',
        host: '127.0.0.1',
        dialect: 'mysql',
        timezone: 'Asia/Seoul'
    },
    production: {
        username: process.env.SEQUELIZE_PRODUCTION_USERNAME,
        password: process.env.SEQUELIZE_PRODUCTION_PASSWORD,
        database: 'societyconnection',
        host: process.env.SEQUELIZE_PRODUCTION_HOST,
        dialect: 'mysql',
        timezone: 'Asia/Seoul',
        logging: false
    }
}