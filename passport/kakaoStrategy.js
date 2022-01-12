const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile);
    try {
      const exUser = await User.findOne({
        where: { id: profile._json.kakao_account.email, login_type: 'kakao' },
      });
      if (exUser) {
        done(null, exUser);
      } else {
        const kakao_user_count = User.findAndCountAll({
          where: {
            login_type:'kakao'
          }
        });
        const new_user_nickname = 'KakaoUser_'+(await kakao_user_count).count;
        console.log(new_user_nickname);
        console.log(profile._json && profile._json.kakao_account.email);
        const newUser = await User.create({
          id: profile._json.kakao_account.email,
          nickname: new_user_nickname,
          login_type: 'kakao',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
