module.exports = {
    isOwner: function (request, response) {
      return request.session.is_logined || false;
    },
    statusUI: function (request, response) {
      var authStatusUI = '<a href="/auth/login">로그인</a>';
      if (this.isOwner(request, response)) {
        if (request.session.user.profile_picture) {
          ui = `<img src="${request.session.user.profile_picture}" alt="프로필 이미지" width="50" height="50">`
        }

        authStatusUI = `${request.session.nickname}님`;
      }
      return authStatusUI;
    }
  }