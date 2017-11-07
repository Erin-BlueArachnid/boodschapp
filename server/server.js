const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {List} = require('./models/list');

let app = express();
const port = process.env.PORT || 3000;

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
    return response.status(404).send({});
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

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
