exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.send('<script> alert("로그인이 필요합니다.");window.location.replace("/");</script>');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.send('<script> alert("로그인한 상태입니다.");window.location.replace("/");</script>');
    }
};
