const mongoose = require('mongoose');

let User = mongoose.model('User', {
  name: {
    type: String,
    trim: true,
    required: true,
    minLength: 1
  },
  email: {
    type: String,
    trim: true,
    required: true,
    minLength: 1
  }
});

module.exports = {User};

// module.exports = {
//   User: User
// };
