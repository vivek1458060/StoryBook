var mongoose = require('mongoose');

var Story = mongoose.model('Story', {
  heading: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  private: {
    type:Boolean,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  comments: [{
    commentedAt: {
      type: Date,
      default: Date.now
    },
    comment: {
      type: String,
      required: true,
      minlength:1,
      trim: true
    },
    commentedBy_userName: {
      type: String,
      required: true
    },
    commentedBy_userId: {
      type: String,
      required: true
    }
  }],
  creatorName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Story};
