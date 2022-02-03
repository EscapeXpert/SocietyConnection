const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
const passportConfig = require('./passport');
const boardRouter = require('./routes/board');
const adminRouter = require('./routes/admin');
const messageRouter = require('./routes/message');
const postRouter = require('./routes/post');
const recruitmentRouter = require('./routes/recruitment');
const authRouter = require('./routes/auth');
const mainRouter = require('./routes/main');
const profileRouter = require('./routes/profile');
const {sequelize} = require('./models');
const User = require('./models/user');
const Grade = require('./models/grade')
const bcrypt = require('bcrypt');

passportConfig();

const app = express();
app.set('port', process.env.PORT || 3001);
app.set('view engine', 'ejs');

sequelize.sync({force: false})
    .then(() => {
        console.log("데이터베이스 연결 성공")
    })
    .catch(() => {
        console.error("데이터베이스 연결 실패")
    });

app.use(morgan('dev'))
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({limit: "100mb", extended: false}));
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

app.use(passport.initialize());
app.use(passport.session());
app.use('/board', boardRouter);
app.use('/admin', adminRouter);
app.use('/message', messageRouter);
app.use('/post', postRouter);
app.use('/recruitment', recruitmentRouter);
app.use('/auth', authRouter);
app.use('/', mainRouter);
app.use('/profile', profileRouter);
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

async function set_default_database() {
    try {
        for (let i = 1; i <= 5; i++) {
            const grade = await Grade.findOne({
                where: {
                    id: i
                }
            });
            if (!grade) {
                await Grade.create({
                    id: i,
                    name: String(i)
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function make_admin() {
    try {
        const ex_admin = await User.findOne({where: {id: 'admin'}});
        if (!ex_admin) {
            console.log('admin 계정이 없어서 admin계정을 생성합니다.');
            const password = 'admin';
            const hash = await bcrypt.hash(password, 12);
            await User.create({
                id: 'admin',
                password: hash,
                nickname: 'admin',
                grade: 5,
            });
        }
    } catch (error) {
        console.error(error);
    }
}

set_default_database();
make_admin();

