const mongoose = require('mongoose');

let List = mongoose.model('List', {
  name: {
    type: String,
    required: true,
    minLength: 1,
    trim: true
  }
});

module.exports = {List};

// module.exports = {
//   List: List
// };
