const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((data, done) => {
        console.log('serializeUser 데이터',data);
        done(null, {id : data.user.id, accessToken : data.accessToken});
    });

    passport.deserializeUser((user, done) => {
        // user = {id : data.user.id, accessToken : data.accessToken}
        console.log('디시리얼라이즈 유저', user);
        User.findOne({ where: { id:user.id } })
            .then((result) => { // db에서 가져온 유저데이터 결과 result
                console.log('디시리얼라이즈에서 찍히는 유저',user);
                result.accessToken = user.accessToken;
                const tokenUser = { result, accessToken : user.accessToken};
                done(null, result); // req.user 에 저장된다.
            }) // 조회한 정보를 req.user에 저장한다.
            .catch((error) => done(error));
    });
    local();
    kakao();
};
