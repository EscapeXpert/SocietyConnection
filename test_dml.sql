USE societyconnection;
INSERT INTO grade(id, name) VALUES (1, '이병');
INSERT INTO grade(id, name) VALUES (2, '일병');
INSERT INTO grade(id, name) VALUES (3, '상병');
INSERT INTO grade(id, name) VALUES (4, '병장');
INSERT INTO grade(id, name) VALUES (5, '말년');
INSERT INTO board(name, min_read_grade, min_write_grade, board_type) VALUES ('자유게시판', 1, 1, 'general');
INSERT INTO board(name, min_read_grade, min_write_grade, board_type) VALUES ('프로젝트 모집게시판', 1, 1, 'recruitment');
INSERT INTO board(name, min_read_grade, min_write_grade, board_type) VALUES ('일병게시판', 2, 2, 'general');

