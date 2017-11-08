const _ = require('lodash');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

let UserSchema = new mongoose.Schema({
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
    minLength: 1,
    unique: true,
    validate: {
      // validator: (value) => {
      //   return validator.isEmail(value);
      // },
      validator: validator.isEmail,
      message:'{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
  
  console.log('token: ', token);
  console.log('attempt 1:', user.tokens);

  user.tokens.push({access, token});
  console.log('attempt 2:', user.tokens);
  console.log('attempt 2:', token);
  
  return user.save().then(() => {
    return token;
  });
};

let User = mongoose.model('User', UserSchema);

module.exports = {User};

// module.exports = {
//   User: User
// };
