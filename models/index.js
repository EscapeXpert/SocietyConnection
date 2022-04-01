const Sequelize = require('sequelize');
const Applicant = require('./applicant');
const Board = require('./board');
const Comment = require('./comment');
const Grade = require('./grade');
const Message = require('./message');
const Post = require('./post');
const PostFile = require('./post_file');
const Recruitment = require('./recruitment');
const ReplyComment = require('./reply_comment');
const User = require('./user');
const Like = require('./like');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.Applicant = Applicant;
db.Board = Board;
db.Comment = Comment;
db.Grade = Grade;
db.Message = Message;
db.Post = Post;
db.PostFile = PostFile;
db.Recruitment = Recruitment;
db.ReplyComment = ReplyComment;
db.User = User;
db.Like = Like;

Applicant.init(sequelize);
Board.init(sequelize);
Comment.init(sequelize);
Grade.init(sequelize);
Message.init(sequelize);
Post.init(sequelize);
PostFile.init(sequelize);
Recruitment.init(sequelize);
ReplyComment.init(sequelize);
User.init(sequelize);
Like.init(sequelize);

Applicant.associate(db);
Board.associate(db);
Comment.associate(db);
Message.associate(db);
Post.associate(db);
PostFile.associate(db);
Recruitment.associate(db);
ReplyComment.associate(db);
User.associate(db);
Like.associate(db);

module.exports = db;