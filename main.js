const express = require('express')
const session = require('express-session')
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const cors = require('cors');

const bodyParser = require('body-parser');

const FileStore = require('session-file-store')(session)
const dotenv = require("dotenv")
dotenv.config();

var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');

const app = express()

app.set('view engine', 'ejs'); // EJS 템플릿 엔진으로 설정
app.set('views', __dirname + '/views'); // EJS 템플릿 파일이 저장된 디렉토리

const port = process.env.PORT

app.use(cors());
app.use(express.static(__dirname + '/public')); // 정적 CSS 파일 제공
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads/profileImg', express.static('./uploads/profileImg'));
app.use(bodyParser.json());

app.use(session({
  secret: 'chs',	
  resave: true,
  saveUninitialized: true,
  store: new FileStore({
    path: './profileImg' 
  }),
}));



app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  }
})


// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return false;
  }
  const userProfile = req.session.user || {};
  if (!userProfile.profile_picture) {
    userProfile.profile_picture = './assets/imgs/origin-profile.png';
  }
  res.render('home/index', { title: 'Welcome', message: '로그인에 성공하셨습니다.', authStatusUI: authCheck.statusUI(req, res),  session: req.session, userProfile: userProfile, req: req, });
});
// 피드백
app.get('/comment', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return false;
  }
  const userProfile = req.session.user || {};
  if (!userProfile.profile_picture) {
    userProfile.profile_picture = './assets/imgs/origin-profile.png';
  }
  res.render('home/comment');
});
// Nodemailer 설정
const emailConfig = {
  service: "gmail", // 이메일 서비스 (Gmail 사용)
  auth: {
    user: "vgmcsent@gmail.com", // 발신자 이메일 주소
    pass: "gcmddomkzhdxhiib", // 발신자 이메일 계정의 암호 (앱 비밀번호를 사용해야 할 수도 있음)
  },
};

app.get('/feedback', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return false;
  }
  
  res.render('home/feedback')
});
app.post('/submit-feedback', (req, res) => {
  const name = req.body.name;
  const message = req.body.message;

  // Nodemailer를 사용하여 이메일 전송
  const transporter = nodemailer.createTransport(emailConfig);

  const mailOptions = {
    from: 'vgmcsent@gmail.com', // 발신자 이메일 주소
    to: 'vgmcyouthcouncil@gmail.com', // 수신자 이메일 주소 (개발자 이메일)
    subject: '쪽지 제출', // 이메일 제목
    text: `이름: ${name}\n메시지: ${message}`, // 이메일 내용
  };



  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('이메일 전송 에러:', error);
      res.status(500).send('피드백 제출에 실패했습니다.');
    } else {
      console.log('이메일 전송 성공:', info.response);
      res.send('피드백이 성공적으로 제출되었습니다.');
    }
  });
});







// 공통 함수: 사용자 정보 가져오기
function getUserInfo(req, res, callback) {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return false;
  }

  // 데이터베이스에서 사용자 정보 가져오기
  db.query('SELECT * FROM usertable WHERE username = ?', [req.session.nickname], function (error, results, fields) {
    if (error) {
      console.error(error);
      // 오류 발생 시 사용자 정보를 세션에 저장하지 않도록 처리
      return callback(null);
    }

    if (results.length > 0) {
      // 사용자 정보를 세션에 저장
      const user = results[0]; // 데이터베이스에서 가져온 첫 번째 사용자 정보
      req.session.user = user;
      return callback(user);
    } else {
      // 사용자 정보를 찾을 수 없는 경우 처리
      return callback(null);
    }
  });
}
// 사용자 정보 수정 페이지

const db = require('./db')

//   app.get('/edit', (req, res) => {
//       if (!authCheck.isOwner(req, res)) {
//         res.redirect('/auth/login');
//         return false;
//       }
//       // 데이터베이스에서 사용자 정보 가져오기
//       db.query('SELECT * FROM usertable WHERE username = ?', [req.session.nickname], function (error, results, fields) {
//         if (error) {
//           console.error(error);
//           // 오류 발생 시 사용자 정보를 세션에 저장하지 않도록 처리
//         }
        
//         if (results.length > 0) {
//           // 사용자 정보를 세션에 저장
//       const user = results[0]; // 데이터베이스에서 가져온 첫 번째 사용자 정보
//       req.session.user = user;
//       const userProfile = req.session.user || {};
//   if (!userProfile.profile_picture) {
//     userProfile.profile_picture = './assets/imgs/origin-profile.png';
//   }

//       var title = '사용자 정보 수정';
//       res.render('home/edit', { authStatusUI: authCheck.statusUI(req, res),  session: req.session, userProfile: userProfile, req: req});
//     } else {
//       // 사용자 정보를 찾을 수 없는 경우 처리
//       res.send('<script>alert("사용자 정보를 찾을 수 없습니다."); document.location.href="/main";</script>');
//     }
//   });
// });
  

// // 사용자 정보 수정 프로세스 (이름 또는 비밀번호 변경)
// app.post('/edit_process', function (request, response) {
//   if (!authCheck.isOwner(request, response)) {
//     // 로그인되지 않은 사용자는 수정할 수 없음
//     response.send('<script>alert("로그인 후 사용자 정보 수정이 가능합니다."); document.location.href="/auth/login";</script>');
//     return;
//   }

//   var newUsername = request.body.username;
//   var newPassword = request.body.password;

//   // 데이터베이스에서 현재 사용자 정보를 가져오고 업데이트
//   var userId = request.session.user.id; // 현재 사용자 ID

//   // 데이터베이스 업데이트 로직을 작성
//   var updateFields = [];
//   var updateValues = [];

//   if (newUsername) {
//     updateFields.push('username = ?');
//     updateValues.push(newUsername);
//   }

//   if (newPassword) {
//     updateFields.push('password = ?');
//     updateValues.push(newPassword);
//   }

//   if (updateFields.length === 0) {
//     response.send('<script>alert("변경할 정보를 입력하세요."); document.location.href="/profile";</script>');
//     return;
//   }

//   updateFields = updateFields.join(', ');

//   db.query(`UPDATE usertable SET ${updateFields} WHERE id = ?`, [...updateValues, userId], function (error, results, fields) {
//     if (error) throw error;

   
//     if (results.affectedRows === 1) {
//       request.session.user.username = newUsername;
//       response.send('<script>alert("수정되었습니다. 다시 로그인 해주세요."); document.location.href="/auth/logout";</script>');
//     } else {
//       response.send('<script>alert("사용자 정보 수정에 실패했습니다."); document.location.href="/edit";</script>');
//     }
//   });
// });


app.use('/lib_login', express.static('public/lib_login', { 
  setHeaders: (res, path, stat) => {
      res.set('Content-Type', 'application/javascript');
  },
}));




const multer = require('multer');
const path = require('path');


const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profileImg/');  
  },
  filename: (req, file, cb) => {
    if (req.session.user) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile_' + req.session.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    } else {
      cb(null, 'profile_default' + path.extname(file.originalname));
    }
  },
});


const profileImageUpload = multer({ storage: profileImageStorage });

app.get('/profile', (req, res) => {
  getUserInfo(req, res, (user) => {
    if (!user) {
      res.redirect('/auth/login');
      return;
    }

    // 여기서 req.session.user 객체를 통해 사용자 정보를 가져옵니다.
    const userProfile = req.session.user || {};
    if (!userProfile.profile_picture) {
      userProfile.profile_picture = req.session.profile_image || './assets/imgs/origin-profile.png';
    }

    res.render('home/profile', {
      userProfile: userProfile,
      authStatusUI: authCheck.statusUI(req, res),
      req: req,
    });
  });
});
//   if (!authCheck.isOwner(req, res)) {
//     res.redirect('/auth/login');
//     return;
//   }

//   if (!req.session.user) {
//     res.redirect('/auth/login');
//     return;
//   }

//   // 여기서 req.session.user 객체를 통해 사용자 정보를 가져옵니다.
//   const userProfile = req.session.user || {};
//   if (!userProfile.profile_picture) {
//     userProfile.profile_picture = req.session.profile_image || './assets/imgs/origin-profile.png';
//   }

//   res.render('home/profile', {
//     userProfile: userProfile,
//     authStatusUI: authCheck.statusUI(req, res),
//     req: req,
//   });
// });

app.post('/profile/upload', profileImageUpload.single('profilePicture'), (req, res) => {
  console.log('Request received at /profile/upload');
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return;
  }
  if (!req.session.user) {
    // 사용자 세션이 없는 경우에 대한 처리
    res.redirect('/auth/login');
    return;
  }

  if (req.file) {
    const userId = req.session.user.id;
    if (!userId) {
      // 사용자 ID가 없는 경우에 대한 처리
      res.redirect('/auth/login');
      return;
    }
    const profileImagePath = './uploads/profileImg/' + req.file.filename;


    db.query('UPDATE usertable SET profile_picture = ? WHERE id = ?', [profileImagePath, userId], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, message: '프로필 이미지 업데이트에 실패했습니다.' });
      } else {
        req.session.user.profile_picture = profileImagePath;
        res.json({ success: true, message: '프로필 이미지가 업데이트되었습니다.' });
      }
    });
  } else {
    res.send('<script>alert("파일 업로드에 실패했습니다."); document.location.href="/profile";</script>');
  }
});
app.post('/profile/edit_process', function (request, response) {
  getUserInfo(request, response, (user) => {
      if (!user) {
          response.send('<script>alert("사용자 정보를 찾을 수 없습니다."); document.location.href="/main";</script>');
          return;
      }

      // 여기서 사용자 정보 수정 프로세스의 로직을 수행할 수 있습니다.
      var newUsername = request.body.username;
      var newPassword = request.body.password;
      console.log('New username:', newUsername);
      console.log('New password:', newPassword);
      // 데이터베이스에서 현재 사용자 정보를 가져오고 업데이트
      var userId = request.session.user.id; // 현재 사용자 ID

      // 데이터베이스에서 중복된 사용자 이름을 검사
      if (request.body.saveUsername) {
          // "이름 저장" 버튼이 눌린 경우
          if (newUsername !== '') {
              db.query('SELECT * FROM usertable WHERE username = ? AND id != ?', [newUsername, userId], function (error, results, fields) {
                  if (error) throw error;

                  if (results.length > 0) {
                      // 중복된 사용자 이름이 이미 존재하는 경우
                      response.send('<script>alert("이미 존재하는 사용자 이름입니다."); document.location.href="/profile";</script>');
                      return;
                  }

                  // 데이터베이스 업데이트 로직을 작성
                  var updateFields = ['username = ?'];
                  var updateValues = [newUsername];

                  db.query(`UPDATE usertable SET ${updateFields} WHERE id = ?`, [...updateValues, userId], function (error, results, fields) {
                      if (error) throw error;

                      if (results.affectedRows === 1) {
                          request.session.user.username = newUsername;
                          response.send('<script>alert("이름이 수정되었습니다, 로그아웃후 다시 로그인 해주세요"); document.location.href="/auth/logout";</script>');
                      } else {
                          response.send('<script>alert("사용자 정보 수정에 실패했습니다."); document.location.href="/profile";</script>');
                      }
                  });
              });
          } else {
              response.send('<script>alert("이름을 입력하세요."); document.location.href="/profile";</script>');
          }
      } else if (request.body.savePassword) {
          // "비밀번호 저장" 버튼이 눌린 경우
          if (newPassword) {
              // 데이터베이스 업데이트 로직을 작성
              var updateFields = ['password = ?'];
              var updateValues = [newPassword];

              db.query(`UPDATE usertable SET ${updateFields} WHERE id = ?`, [...updateValues, userId], function (error, results, fields) {
                  if (error) throw error;

                  if (results.affectedRows === 1) {
                      response.send('<script>alert("비밀번호가 수정되었습니다, 다시 로그인 해주세요"); document.location.href="/auth/logout";</script>');
                  } else {
                      response.send('<script>alert("사용자 정보 수정에 실패했습니다."); document.location.href="/profile";</script>');
                  }
              });
          } else {
              response.send('<script>alert("비밀번호를 입력하세요."); document.location.href="/profile";</script>');
          }
      } else {
          response.send('<script>alert("올바르지 않은 요청입니다."); document.location.href="/profile";</script>');
      }
  });
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})