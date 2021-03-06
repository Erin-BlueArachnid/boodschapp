const {ObjectID} = require('mongodb');
const {List} = require('./../../models/list');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
  _id: userOneID,
  name: 'Erin',
  email: 'erin@me.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneID, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoID,
  name: 'Anine',
  email: 'anine@me.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoID, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]

const lists = [{
  _id: new ObjectID(),
  name: "Aldi",
  _creator: userOneID
}, {
  _id: new ObjectID(),
  name: "Albert Heijn",
  _creator: userTwoID
}];

const populateLists = (done) => {
  List.remove({}).then(() => {
    // return makes it possible to chain callbacks
    return List.insertMany(lists);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {lists, populateLists, users, populateUsers};
