const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');
const axios = require("axios");

module.exports = () => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        //console.log('profile',profile);
        let new_user_gender;
        try {
            if (profile._json.kakao_account.email_needs_agreement === true) {
                try {
                    let logout = await axios({
                        method: 'post',
                        url: 'https://kapi.kakao.com/v1/user/unlink',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
                throw new Error('이메일 수집 동의를 선택해주세요.');
            }
            const exUser = await User.findOne({
                where: {id: profile._json.kakao_account.email, login_type: 'kakao'},
            });
            if (exUser) {
                const tokenUser = {
                    user: exUser,
                    accessToken: accessToken
                }
                done(null, tokenUser);
            } else {
                const kakao_user_count = User.findAndCountAll({
                    where: {
                        login_type: 'kakao'
                    }
                });
                if (profile._json.kakao_account.gender === 'male') {
                    new_user_gender = true;
                } else {
                    new_user_gender = false;
                }
                const new_user_nickname = 'KakaoUser_' + (await kakao_user_count).count;
                const newUser = await User.create({
                    id: profile._json.kakao_account.email,
                    sns_id: profile.id,
                    nickname: new_user_nickname,
                    name: profile.displayName,
                    gender: new_user_gender,
                    profile_image: profile._json.properties.profile_image,
                    login_type: 'kakao',
                });
                const tokenUser = {
                    user: newUser,
                    accessToken: accessToken
                }
                done(null, tokenUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
