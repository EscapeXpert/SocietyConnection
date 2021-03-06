const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cron = require('node-cron');
const helmet = require('helmet');
const hpp = require('hpp');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

dotenv.config();
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
    legacyMode: true
});
(async () => {
    await redisClient.connect();
})();

redisClient.on('connect', () => console.log('::> Redis Client Connected'));
redisClient.on('error', (err) => console.log('<:: Redis Client Error', err));

const passportConfig = require('./passport');
const logger = require('./logger');
const boardRouter = require('./routes/board');
const adminRouter = require('./routes/admin');
const messageRouter = require('./routes/message');
const postRouter = require('./routes/post');
const authRouter = require('./routes/auth');
const mainRouter = require('./routes/main');
const profileRouter = require('./routes/profile');
const {sequelize} = require('./models');
const {Op} = require('sequelize');
const Board = require('./models/board');
const User = require('./models/user');
const Grade = require('./models/grade');
const PostFile = require('./models/post_file');
const Post = require('./models/post');
const Recuritment = require('./models/recruitment');
const bcrypt = require('bcrypt');
const fs = require("fs");
const expressLayouts = require('express-ejs-layouts');

passportConfig();

const app = express();
app.set('port', process.env.PORT || 3001);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(expressLayouts);
app.set("layout extractScripts", true);

async function set_default_database() {
    const grade_name = ['방문자', '준회원', '정회원', '운영진', '관리자']
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
                    name: grade_name[i - 1]
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

sequelize.sync({force: false})
    .then(async () => {
        console.log("데이터베이스 연결 성공");
        await set_default_database();
        await make_admin();
    })
    .catch(() => {
        console.error("데이터베이스 연결 실패");
    });

if(process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    app.use(helmet({contentSecurityPolicy: false}));
    app.use(hpp());
} else {
    app.use(morgan('dev'));
}

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({limit: "100mb", extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    },
    store: new RedisStore({
        client: redisClient
    })
};

if(process.env.NODE_ENV === 'production') {
    sessionOption.proxy = false;
    sessionOption.cookie.secure = false;
}
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
    const boards = await Board.findAll({
        attributes: ['id', 'name']
    });
    res.locals.boards = boards;
    next();
});
app.use('/board', boardRouter);
app.use('/admin', adminRouter);
app.use('/message', messageRouter);
app.use('/post', postRouter);
app.use('/auth', authRouter);
app.use('/', mainRouter);
app.use('/profile', profileRouter);
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    logger.info('hello');
    logger.error(error.message);
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error', {layout: false});
});

cron.schedule('0 0 * * *', async () => {
    try {
        const img_files = fs.readdirSync('./uploads/post/img');
        for(file of img_files)
        {
            const post = await Post.findAll({
                attributes: ['id'],
                where: {
                    content: {
                        [Op.like]: `%${file}%`
                    }
                }
            });
            const recruitment = await Recuritment.findAll({
                attributes: ['id'],
                where: {
                    content: {
                        [Op.like]: `%${file}%`
                    }
                }
            });
            if(recruitment[0] === undefined && post[0] === undefined)
            {
                fs.unlinkSync('./uploads/post/img/' + file);
            }
        }
        const post_files = fs.readdirSync('./uploads/post/file');
        for(file of post_files)
        {
            const post_file = await PostFile.findAll({
                attributes: ['id'],
                where: {
                    file_path: {
                        [Op.like]: `%${file}%`
                    }
                }
            });
            if(post_file[0] === undefined)
            {
                fs.unlinkSync('./uploads/post/file/' + file);
            }
        }
    } catch(error) {
        console.error(error);
    }
});

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 생성합니다.');
    fs.mkdirSync('uploads');
}
try {
    fs.readdirSync('./uploads/profile');
} catch (error) {
    console.error('./uploads/profile 폴더가 없어 생성합니다.');
    fs.mkdirSync('./uploads/profile');
}
try {
    fs.readdirSync('./uploads/post');
} catch (error) {
    console.error('uploads/post 폴더가 없어 생성합니다.');
    fs.mkdirSync('./uploads/post');
}

try {
    fs.readdirSync('./uploads/post/img');
} catch (error) {
    console.error('uploads/post/img 폴더가 없어 생성합니다.');
    fs.mkdirSync('./uploads/post/img');
}

try {
    fs.readdirSync('./uploads/post/file');
} catch (error) {
    console.error('uploads/post/file 폴더가 없어 생성합니다.');
    fs.mkdirSync('./uploads/post/file');
}

module.exports = app;

