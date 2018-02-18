var token = localStorage.getItem('token');
$.ajax({
  type: 'GET',
  url: '/verifytoken',
  headers: { 'x-auth': localStorage.getItem('token') },
  success: function(user) {
    $('.navUserLink').empty().append(`
      <li class="dropdown">
         <a  href="#" class="dropdown-toggle navUserName" data-toggle="dropdown">${user.fullName}</a>
         <ul class="dropdown-menu">
            <li class="dropdown-menu-item">
               <div class="media">
                  <div class="media-left">
                    <img src="/images/profile.png" class="media-object img-thumbnail img-circle" width="80" height="90">
                  </div>
                  <div class="media-body text-sm">
                    <small class="media-heading"><strong>${user.fullName}</strong><br/>
                    ${user.email}
                    </small><br/>
                    <a href="#" id="logout" class="btn btn-primary" style="margin-top:5px;">Logout</a>
                  </div>
               </div>
            </li>
         </ul>
      </li>
    `);
    $('#loginSuggestionDivToComment').remove();
    $('#editPageLogin').remove();
    $('#add-note').removeClass('disabled');
  },
  error: function() {
    token = null;

    $('.editPage').prepend(`
      <div class="panel panel-default">
       <div class="panel-body">
        <p id="editPageLogin">Login to Get, Edit and Write your new story</p>
        <a href="/login" class="btn btn-primary" id="logout">Login Here</a>
       </div>
      </div>
    `);

  }
});

$(function() {

  if (token) {

    $.ajaxSetup({
      headers: {
        'x-auth': token
      }
    });
    
    //image upload
    $("#imageUploadForm").submit(function (event) {
      event.preventDefault();
      var form = $('#imageUploadForm')[0];
      var data = new FormData(form);
    
      $.ajax({
          type: "POST",
          enctype: 'multipart/form-data',
          url: "/upload",
          data: data,
          processData: false,
          contentType: false,
          cache: false,
          timeout: 600000,
          success: function (data) {
    
              $('#myImage').attr('src', '/uploads/'+ data.filename);
              alert('success');
    
          },
          error: function (e) {
    
              alert(e.responseText);
    
          }
      });
    });

    $('.navUserLink').delegate('#logout', 'click', function() {
      $.ajax({
        type: 'DELETE',
        url: '/users/me/token',
        success: function() {
          localStorage.removeItem('token');
          window.open('/', '_self');
        },
        error: function() {
          alert('error logging out');
        }
      });
    });

    $('.comment').on('keyup', function(e) {
      $comment = $('.comment');
      if (e.keyCode === 13) {
      var note = {
        comment: $comment.val(),
      };

      $.ajax({
        type: 'PATCH',
        url: `/stories/comment/${$comment.attr('id')}`,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(note),
        success: function(comments) {
            $comment.val('');
            $('#oneStory').prepend(`
              <div class="well" >
                <p>${comments.comment}
                  <a href="/publicprofile/${comments.commentedBy_userId}" class="btn btn-default btn-xs" style="border-radius:10px;"><span class="glyphicon glyphicon-user"></span> ${comments.commentedBy_userName}</a>
                </p>
                <small>${moment(comments.commentedAt).format("LLLL")}</small>
              </div>
              `);
        },
        error: function() {
          alert('error commenting');
        }
      });
    }
    });

    var $notes = $('#notes');
    var $heading = $('#heading');
    var $text = $('#text');
    var $remove = $('.remove');

    var noteTemplate = $('#noteTemplate').html();
    var template = Handlebars.compile(noteTemplate);

    function addNote(note) {
      $notes.append(template(note));
    }

    $.ajax({
      type: 'GET',
      url: '/stories',
      success: function(notes) {
        $.each(notes.stories, function(i, note) {
          addNote(note);
        });
      },
      error: function() {
        alert('error loading notes');
      }
    });

    $('#add-note').on('click', function() {
      var $private = $('input[name=private]:checked').val();

      var note = {
        heading: $heading.val(),
        text: $text.val()
      };

      if ($private === 'private') {
        note.private = true;
      } else {
        note.private = false;
      }

      $.ajax({
        type: 'POST',
        url: '/stories',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(note),
        success: function(newNote) {
          $heading.val('');
          $text.val('');
          addNote(newNote.story);
        },
        error: function() {
          alert('error posting note');
        }
      });
    });

    $notes.delegate('.remove', 'click', function() {
      $li = $(this).closest('li');

      $.ajax({
        type: 'DELETE',
        url: `/stories/${$li.attr('data-id')}`,
        success: function() {
          $li.fadeOut(300, function() {
            $(this).remove();
          });
        },
        error: function() {
          alert('error deleting note');
        }
      });
    });

    $notes.delegate('.editNote', 'click', function() {
      $li = $(this).closest('li');
      $li.find('input.heading').val($li.find('span.heading').html());
      $li.find('textarea.text').val($li.find('span.text').html());
      $li.addClass('edit');
    });

    $notes.delegate('.cancelEdit', 'click', function() {
      $li = $(this).closest('li');
      $li.removeClass('edit');
    });

    $notes.delegate('.saveEdit', 'click', function() {
      $li = $(this).closest('li');

      var note = {
        heading: $li.find('input.heading').val(),
        text: $li.find('textarea.text').val()
      };

      $.ajax({
        type: 'PATCH',
        url: `/stories/${$li.attr('data-id')}`,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(note),
        success: function(newNote) {
          $li.find('span.heading').html(note.heading);
          $li.find('span.text').html(note.text);
          $li.removeClass('edit');
        },
        error: function() {
          alert('error updating note');
        }
      });
    });
  }
});