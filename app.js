const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
const boardRouter = require('./routes/board');
const messageRouter = require('./routes/message');
const postRouter = require('./routes/post');
const {sequelize} = require('./models');

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
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));

app.use('/board', boardRouter);
app.use('/message', messageRouter);
app.use('/post', postRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
