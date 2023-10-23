const express = require('express')
const session = require('express-session')
const ejs = require('ejs');

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

app.use(express.static(__dirname + '/public')); // 정적 CSS 파일 제공
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'chs',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore(),
}))

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
    res.render('home/index', { title: 'Welcome', message: '로그인에 성공하셨습니다.', authStatusUI: authCheck.statusUI(req, res) });
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})