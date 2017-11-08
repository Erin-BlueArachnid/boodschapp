const mongoose = require('mongoose');

let List = mongoose.model('List', {
  name: {
    type: String,
    required: true,
    minLength: 1,
    trim: true
  },
  _creator: {
    require: true,
    type: mongoose.Schema.Types.ObjectId
  }
});

module.exports = {List};

// module.exports = {
//   List: List
// };
