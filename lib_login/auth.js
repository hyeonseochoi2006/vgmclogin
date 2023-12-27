var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');

var db = require('../db.js');





// 로그인 화면
router.get('/login', function (request, response) {
    var title = '로그인';
    response.render('home/login', { title: title });
});

// 로그인 프로세스
router.post('/login_process', function (request, response) {
    var username = request.body.username;
    var password = request.body.pwd;
    if (username && password) {             // id와 pw가 입력되었는지 확인
        
        db.query('SELECT * FROM usertable WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                const user = {id: results[0].id,}
                request.session.is_logined = true;      // 세션 정보 갱신
                request.session.nickname = username;
                request.session.user = user;
                db.query('SELECT profile_picture FROM usertable WHERE username = ?', [username], function (error, results, fields) {
                    if (error) throw error;
                    if (results.length > 0) {
                        user.profile_picture = results[0].profile_picture;
                    } else {
                        user.profile_picture = '../assets/imgs/origin-profile.png'; // 기본 프로필 이미지 경로
                    }

                    request.session.user.profile_picture = user.profile_picture;

                    request.session.save(function () {
                        response.redirect('/');
                    });
                });
            } else {              
                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/auth/login";</script>`);    
            }            
        });

    } else {
        response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/auth/login";</script>`);    
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    // 세션을 파기하고 로그아웃 처리
    request.session.destroy(function (err) {
        if (err) {
            console.error(err);
        }
        response.redirect('/');
    });
});

// 회원가입 화면
router.get('/register', function(request, response) {
    var title = '회원가입';    
    response.render('home/register', { title: title });
});
 
// 회원가입 프로세스
router.post('/register_process', function(request, response) {    
    var username = request.body.username;
    var password = request.body.pwd;    
    var password2 = request.body.pwd2;

    if (username && password && password2) {
        
        db.query('SELECT * FROM usertable WHERE username = ?', [username], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0 && password == password2) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우 
                db.query('INSERT INTO usertable (username, password) VALUES(?,?)', [username, password], function (error, data) {
                    if (error) throw error2;
                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                    document.location.href="/";</script>`);
                });
            } else if (password != password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우
                response.send(`<script type="text/javascript">alert("입력된 비밀번호가 서로 다릅니다."); 
                document.location.href="/auth/register";</script>`);    
            }
            else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                response.send(`<script type="text/javascript">alert("이미 존재하는 아이디 입니다."); 
                document.location.href="/auth/register";</script>`);    
            }            
        });

    } else {        // 입력되지 않은 정보가 있는 경우
        response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
        document.location.href="/auth/register";</script>`);
    }
});






module.exports = router;