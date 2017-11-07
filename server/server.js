require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {List} = require('./models/list');

const port = process.env.PORT;
let app = express();

app.use(bodyParser.json());

app.post('/lists', (request, response) => {
  let newList = new List({
    name: request.body.name
  });

  newList.save().then((doc)=> {
    response.send(doc);
  }, (e) => {
    response.status(400).send(e);
  });
});

app.get('/lists', (request, response) => {
  List.find().then((lists) => {
    // You could send the todos back in an array like below,
    // but that way you're unable to add another property: custom status code, etc.
    // response.send(todos);

    // Passing in an object and setting it equal to the array (ES6) gives more freedom
    response.send({lists});
  }, (error) => {
    response.status(400).send(error);
  });
});

app.get('/lists/:id', (request, response)=> {
  let id = request.params.id;
  if (!ObjectId.isValid(id)) {
    return response.status(404).send();
  }

  List.findById(id).then((list) => {
    if (!list) {
      return response.status(404).send();
    }
    response.send({list});
  }).catch(()=> {
    response.status(400).send();
  });
});

app.patch('/lists/:id', (request, response) => {
  let id = request.params.id;
  // the updates will be stored on the request body
  // with pick you can specify the properties that have to be picked off
  let body = _.pick(request.body, ['name']);
  if (!ObjectId.isValid(id)) {
    return response.status(404).send();
  }

  List.findByIdAndUpdate(id, {$set: body}, {new: true}).then((list) => {
    if (!list) {
      return response.status(404).send();
    }
    response.send({list});
  }).catch((error) => {
    response.status(400).send();
  });
});

app.delete('/lists/:id', (request, response) => {
  let id = request.params.id;
  if (!ObjectId.isValid(id)) {
    return response.status(404).send();
  }
  List.findByIdAndRemove(id).then((list) => {
    // setup if statement to show that nothing was deleted
    if(!list) {
      response.status(404).send({list});
    }
    response.send({list});
  }).catch((error) =>  {
    response.status(400).send(error);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
