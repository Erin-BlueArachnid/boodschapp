require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {List} = require('./models/list');
const {authenticate} = require('./middleware/authenticate')

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/lists', authenticate, (request, response) => {
  // Create new instance of the List model
  let newList = new List({
    name: request.body.name,
    _creator: request.user._id
  });

  newList.save().then((doc)=> {
    response.send(doc);
  }, (e) => {
    response.status(400).send(e);
  });
});

app.get('/lists', authenticate, (request, response) => {
  List.find({
    _creator: request.user._id
  }).then((lists) => {
    // You could send the todos back in an array like below,
    // but that way you're unable to add another property: custom status code, etc.
    // response.send(todos);

    // Passing in an object and setting it equal to the array (ES6) gives more freedom
    response.send({lists});
  }, (error) => {
    response.status(400).send(error);
  });
});

app.get('/lists/:id', authenticate, (request, response)=> {
  let id = request.params.id;
  if (!ObjectId.isValid(id)) {
    return response.status(404).send();
  }

  List.findOne({
    _id: id,
    _creator: request.user._id
  }).then((list) => {
    if (!list) {
      return response.status(404).send();
    }
    response.send({list});
  }).catch(()=> {
    response.status(400).send();
  });
});

app.patch('/lists/:id', authenticate, (request, response) => {
  let id = request.params.id;
  // the updates will be stored on the request body
  // with pick you can specify the properties that have to be picked off
  let body = _.pick(request.body, ['name']);
  if (!ObjectId.isValid(id)) {
    return response.status(404).send();
  }

  List.findOneAndUpdate({_id: id, _creator: request.user._id}, {$set: body}, {new: true}).then((list) => {
    if (!list) {
      return response.status(404).send();
    }
    response.send({list});
  }).catch((error) => {
    response.status(400).send();
  });
});

app.delete('/lists/:id', authenticate, (request, response) => {
  let id = request.params.id;
  if (!ObjectId.isValid(id)) {
    return response.status(404).send();
  }
  // List.findByIdAndRemove({
  // You not only want to find by ID but also by creator
  List.findOneAndRemove({
    _id: id,
    _creator: request.user._id
  }).then((list) => {
    // setup if statement to show that nothing was deleted
    if(!list) {
      response.status(404).send({list});
    }
    response.send({list});
  }).catch((error) =>  {
    response.status(400).send(error);
  });
});

app.post('/users', (request, response) => {
  let body = _.pick(request.body, ["name", "email", "password"])
  let user = new User(body);
  // let newUser = new User({
  //   name: body.name,
  //   email: body.email,
  //   password: body.password
  // });

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    // when prexifing a header with x- you're creating a custom header
    response.header('x-auth', token).send(user);
  }).catch((error) => {
    response.status(400).send(error);
  });
});

app.post('/users/login', (request, response) => {
  let body = _.pick(request.body, ["email", "password"]);
  User.findByCredentials(body.email, body.password).then((user) => {
    // The return below keeps the chain alive. If the part below fails it will go on to the catch method.
    return user.generateAuthToken().then((token) => {
      response.header('x-auth', token).send(user);
    });
  }).catch((error) => {
    response.status(400).send();
  });
});

app.get('/users/me', authenticate, (request, response) => {
  response.send(request.user);
});

app.delete('/users/me/token', authenticate, (request, response) => {
  request.user.removeToken(request.token).then(() => {
    response.status(200).send();
  }, () => {
    response.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (request, response) => {
  request.user.removeToken(request.token).then(() => {
    response.status(200).send();
  }, () => {
    response.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
