var $loginDiv = $('.loginDiv');
var $signUpDiv = $('.signUpDiv');
var $loginErr = $('#loginErr');
var $signUpErr = $('#signUpErr');

$('.navLoginLink').on('click', function() {

  $loginDiv.show();
  $signUpDiv.hide();
});

$('.navSignUpLink').on('click', function() {

  $loginDiv.hide();
  $signUpDiv.show();
});

function login() {
    var email = $("#loginForm input[name=email]").val();
    var password = $("#loginForm input[name=password]").val();

    var data = {
      email: email,
      password: password
    };

    $.ajax({
      type: 'POST',
      url: '/users/login',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: function(user, textStatus, xhr) {
        token = xhr.getResponseHeader('x-auth');
        localStorage.setItem('token', token);
        window.open("/", '_self');
      },
      error: function() {
        $('#loginErr').html("The email address or phone number that you've entered doesn't match any account.").show();
      }
    });
    return false
}

function signUp() {
    var fullName = $("#signUpForm input[name=fullName]").val();
    var email = $("#signUpForm input[name=email]").val();
    var password = $("#signUpForm input[name=password]").val();

    var data = {
      fullName: fullName,
      email: email,
      password: password
    };

    $.ajax({
      type: 'POST',
      url: '/users',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: function(user, textStatus, xhr) {
        token = xhr.getResponseHeader('x-auth');
        localStorage.setItem('token', token);
        window.open("/", '_self');
      },
      error: function() {
        $('#signUpErr').html("The email or password is not valid").show();
      }
    });
    return false
}

$.ajax({
  type: 'GET',
  url: '/verifytoken',
  headers: { 'x-auth': localStorage.getItem('token') },
  success: function(user) {
    window.open("/", '_self');
  }
});
