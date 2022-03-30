const request = require('supertest');
const { JSDOM } = require( "jsdom" );
const {sequelize} = require('../models');
const Grade = require('../models/grade');
const app = require('../app');

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

beforeAll(async () => {
    await sequelize.sync({force: true});
    await set_default_database();
});

describe('POST /auth/join', () => {
    test('회원가입 수행', (done) => {
        const agent = request.agent(app);
        agent.get('/')
            .end(function(err, res) {
                const { document } = (new JSDOM(res.text)).window;
                const csrf = document.querySelector("input[name='_csrf']").value;
                agent.post('/auth/join')
                    .send({
                        id: 'test',
                        password: 'test1234@',
                        verify_password: 'test1234@',
                        nickname: '테스트계정',
                        _csrf: csrf
                    })
                    .expect('location', '/')
                    .expect(302, done);
            });
    });
});

describe('POST /auth/login', () => {
    beforeEach((done) => {
        const agent = request.agent(app);
        agent.get('/')
            .end(function (err, res) {
                const { document } = (new JSDOM(res.text)).window;
                const csrf = document.querySelector("input[name='_csrf']").value;
                agent.post('/auth/login')
                    .send({
                        id: 'test',
                        password: 'test1234@',
                        _csrf: csrf
                    })
                    .end(done);
            });
    });

    test('로그인을 하고 로그인 수행', (done) => {
        const agent = request.agent(app);
        agent.get('/')
            .end(function (err, res) {
                const { document } = (new JSDOM(res.text)).window;
                const csrf = document.querySelector("input[name='_csrf']").value;
                agent.post('/auth/login')
                    .send({
                        id: 'test',
                        password: 'test1234@',
                        _csrf: csrf
                    })
                    .expect('location', '/')
                    .expect(302, done);
            });
    });

    test('로그인을 하고 회원가입 수행', (done) => {
        const agent = request.agent(app);
        agent.get('/')
            .end(function (err, res) {
                const { document } = (new JSDOM(res.text)).window;
                const csrf = document.querySelector("input[name='_csrf']").value;
                agent.post('/auth/join')
                    .send({
                        id: 'test1',
                        password: 'test1234@',
                        verify_password: 'test1234@',
                        nickname: '테스트계정1',
                        _csrf: csrf
                    })
                    .expect('location', '/')
                    .expect(302, done);
            });
    });
});

afterAll(async () => {
    //await sequelize.sync({force: true});
});
