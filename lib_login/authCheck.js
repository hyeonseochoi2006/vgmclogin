module.exports = {
    isOwner: function (request, response) {
      return request.session.is_logined || false;
    },
    statusUI: function (request, response) {
      var authStatusUI = '<a href="/auth/login">로그인</a>';
      if (this.isOwner(request, response)) {
        authStatusUI = `${request.session.nickname}님`;
      }
      return authStatusUI;
    }
  }