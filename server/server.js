var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var {ObjectID} = require('mongodb');
var hbs = require('hbs');
var moment = require('moment');

var {mongoose} = require('./db/mongoose');
var {Story} = require('./models/story');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
var parseFormHeaderToken = require('./middleware/parseFormHeaderToken');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');


app.get('/', (req, res) => {
  res.render('index');
});

app.post('/editstory', [parseFormHeaderToken, authenticate], (req, res) => {
    res.render('editstory');
});

//add new story
app.post('/stories', authenticate, (req, res) => {
   var story = new Story({
     heading: req.body.heading,
     text: req.body.text,
     private: req.body.private,
     creatorName: req.user.fullName,
     _creator: req.user._id
   });

   story.save().then((story) => {
     res.send({story});
   }).catch((e) => {
     res.status(400).send(e);
   });
});

//get all public strories
app.get('/stories/public', (req, res) => {
  Story.find({
    private: false
  }).then((stories) => {
    res.render('publicstories', {stories});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

//get all strories of authenticated user
app.get('/stories',authenticate, (req, res) => {
  Story.find({
    _creator: req.user._id
  }).then((stories) => {
    res.send({stories});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

//get all public stories from an individual user
app.get('/stories/:id', (req, res) => {
  var id = req.params.id;

  Story.find({
    _creator: id,
    private: false
  }).then((stories) => {
    res.render('publicstories', {stories});
  }).catch((e) => {
    res.status(400).send(e);
  });
});

//get individual public story
app.get('/stories/public/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Story.findOne({_id: id, private: false}).then((story) => {
    if(!story) {
      return res.status(404).send();
    }

    res.render('readone',{
      heading: story.heading,
      text: story.text,
      creatorName: story.creatorName,
      creator: story._creator,
      comments: story.comments
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

//delete a story
app.delete('/stories/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Story.findOneAndRemove({_id: id, _creator: req.user._id}).then((story) => {
    if(!story) {
      return res.status(404).send();
    }

    res.send({story});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

//update a story
app.patch('/stories/:id',authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['heading', 'text', 'private', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Story.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((story) => {
    if(!story) {
      return res.status(404).send();
    }

    res.send({story});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

//comment on a story
app.patch('/stories/comment/:id',authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['comment']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  body.commentedBy_userName = req.user.fullName;
  body.commentedBy_userId = req.user._id;

  Story.findOneAndUpdate({_id: id}, {$push: {comments: body}}, {new: true}).then((story) => {
    if(!story) {
      return res.status(404).send();
    }

    res.send({story});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['fullName', 'email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
      res.status(400).send();
  });
});

app.delete('/users/me/token',authenticate, (req, res) => {

  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.listen(3000, () => {
  console.log('Server started up on port 3000');
});
