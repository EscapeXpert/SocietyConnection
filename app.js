const express = require('express');
const path = require('path');
const morgan = require('morgan');

const {sequelize} = require('sequelize');

const app = express();
app.set('port', process.env.PORT || 3001);
app.set('view engine', 'ejs');

sequelize.sync({force: false})
    .then(() => {
        console.log("데이터베이스 연결 성공")
    })
    .catch(() => {
        console.error("데이터베이스 연결 실패")
    })

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}))
