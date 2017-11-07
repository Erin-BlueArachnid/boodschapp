const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {List} = require('./models/list');

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

app.listen(3000, () => {
  console.log("Started on port 3000");
});

