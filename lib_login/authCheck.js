module.exports = {
    isOwner: function (request, response) {
      return request.session.is_logined || false;
    },
    statusUI: function (request, response) {
      var authStatusUI = '<a href="/auth/login">로그인</a>';
      if (this.isOwner(request, response)) {
        authStatusUI = `${request.session.nickname}님 VGMC청소년부에 오신걸 환영합니다`;
      }
      return authStatusUI;
    }
  }