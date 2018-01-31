
  $('#login').on('click', function() {
      var data = {
        email: $('#email').val(),
        password: $('#password').val()
      };

      $.ajax({
        type: 'POST',
        url: '/users/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(user, textStatus, xhr) {
          var token = xhr.getResponseHeader('x-auth');
          localStorage.setItem('token', token);
          getIndexHtml(token);
          CRUDFunction(token);
        },
        error: function() {
          $('#loginErr').show();
        }
      });
  });

function getIndexHtml(token) {
  $.ajax({
    type: 'GET',
    url: '/index',
    headers: { 'x-auth': token },
    async: false,
    success: function(indexHtml) {
      $('#loginDiv').html(indexHtml);
    },
    error: function() {
      alert(`Can't get indexHtml`);
    }
  });
};
