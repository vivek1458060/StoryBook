var token = localStorage.getItem('token');

function getToken(id) {
    $(`#${id}`).val(token);
    return true;
};

$(function() {

  if(token) {

    $.ajaxSetup({
    headers: {
      'x-auth': token
    }
  });

    var $notes = $('#notes');
    var $heading = $('#heading');
    var $text = $('#text');
    var $remove = $('.remove');
    var $signUpIcon = $('#signUpIcon');
    var $loginIcon = $('#loginIcon');

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
           $signUpIcon.html('');
           $loginIcon.html('');
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

      if($private === 'private'){
        note.private = true;
      } else {
        note.private = false;
      }

      $.ajax({
        type: 'POST',
        url: '/stories',
        contentType:'application/json; charset=utf-8',
        data: JSON.stringify(note),
        success: function(newNote) {
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

    $notes.delegate('.saveEdit','click', function() {
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
  };

});
