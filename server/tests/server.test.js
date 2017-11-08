const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {User} = require('../models/user');
const {List} = require('../models/list');
const {lists, populateLists, users, populateUsers} = require('./seed/seed');

// beforeEarch is a testing lifecycle method
// runs this code before every testcase
beforeEach(populateUsers);
beforeEach(populateLists);

describe('POST lists', () => {
  it('should create a new list',(done) => {
    let name = "Dirk";
    request(app)
      .post('/lists')
      .set('x-auth', users[0].tokens[0].token)
      // Object below gets conferted to JSON by supertest
      .send({name})
      .expect(200)
      .expect((response) => {
        // body is object, has text prop = var above
        expect(response.body.name).toBe(name);
      })
      .end((error, response) => {
        if (error) {
          // stop function execution after passing done with the error
          return done(error);
        }
        List.find({name}).then((lists) => {
          expect(lists.length).toBe(1);
          expect(lists[0].name).toBe(name);
          // If the above statements fail, test is still going to pass, therefore add catch
          done();
        }).catch((error) => done(error));
      })
  });

  it('should not create list with invalid data', (done) => {
    request(app)
      .post('/lists')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        List.find().then((lists) => {
          expect(lists.length).toBe(2);
          done();
        }).catch((error) => done(error));
    });
  });
});

describe('GET /lists', () => {
  it('should get all lists', (done) => {
    request(app)
      .get('/lists')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((response) => {
        expect(response.body.lists.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /lists/:id', () => {
  it('should return a document', (done) => {
    request(app)
      // to convert a Object to a string use: toHexString method
      .get(`/lists/${lists[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((response) => {
        expect(response.body.list.name).toBe(lists[0].name);
      })
      .end(done)
  });
  it('should not return a list document created by other user', (done) => {
    request(app)
      // to convert a Object to a string use: toHexString method
      .get(`/lists/${lists[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  });
  it('should return a 404 when an invalid ID is passed', (done) => {
    request(app)
      .get('/lists/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  });
  it('should return a 404 if list is not found', (done) => {
    request(app)
      .get(`/lists/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  });
});

describe('PATCH /lists/:id', () => {
  it('should update a list', (done) => {
    request(app)
      .patch(`/lists/${lists[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        name: "Jumbo"
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.list.name).toBe("Jumbo")
      })
      .end(done);
  });
  it('should not update a list created by other user', (done) => {
    request(app)
      .patch(`/lists/${lists[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        name: "Jumbo"
      })
      .expect(404)
      .end(done);
  });
  it('should not update a list when ID is invalid', (done) => {
    request(app)
      .patch(`/lists/${lists[1]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send()
      .expect(200)
      .end(done)
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a list', (done) => {
    let hexID = lists[1]._id.toHexString();
    
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((response) => {
        expect(response.body.list._id).toBe(hexID);
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        List.findById(hexID).then((list) => {
          expect(list).toNotExist();
          done();
        }).catch((error) => done(error));
      })
  });
  
  it('should delete a list', (done) => {
    let hexID = lists[0]._id.toHexString();
    
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        List.findById(hexID).then((list) => {
          expect(list).toExist();
          done();
        }).catch((error) => done(error));
      })
  });
  
  it('should return 404, if list not found', (done) => {
    // make sure you get a 404 back
    let hexId = new ObjectID().toHexString();
    
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done)
  });
  it('should return 404, if objectID is invalid', (done) => {
    request(app)
    .delete(`/todos/123`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end(done)
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((response) => {
      expect(response.body._id).toBe(users[0]._id.toHexString());
      expect(response.body.email).toBe(users[0].email);
    })
    .end(done);
  });
  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      // .set()
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    let name = 'Example';
    let email = 'example@test.com';
    let password = '123mbk!';

    request(app)
      .post('/users')
      .send({name, email, password})
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-auth']).toExist();
        expect(response.body.name).toBe(name);
        expect(response.body._id).toExist();
        expect(response.body.email).toBe(email);
      })
      .end((error) => {
        if (error) {
          return done();
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          // check if passwords get hashed
          expect(user.password).toNotBe(password);
          done();
        }).catch((error) => done(error));
      })
  });
  
  it('should return validation errors if request is invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        name: 'Password Toshort',
        email: 'invalidEmail',
        password: '123!'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email is already used', (done) => {
    request(app)
      .post('/users')
      .send({
        name: 'Kopie Email',
        email: users[0].email,
        password: 'qwerty1234!'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login a user', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((result) => {
        expect(result.headers['x-auth']).toExist();
      })
      .end((error, result) => {
        if(error) {
          return done(error);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: result.headers['x-auth']
          });
          done();
        }).catch((error) => done(error));
    });
  });
  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((result) => {
        expect(result.headers['x-auth']).toNotExist();
      })
      .end((error, result) => {
        if(error) {
          return done(error);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((error) => done(error));
      })
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((error, result) => {
        if (error) {
          return done(error);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((error) => done(error));
      });
  });
});
