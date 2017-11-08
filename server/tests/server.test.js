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
      .expect(200)
      .expect((response) => {
        expect(response.body.lists.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /lists/:id', () => {
  it('should return a 404 when an invalid ID is passed', (done) => {
    request(app)
      .get('/lists/123')
      .expect(404)
      .end(done)
  });
  it('should return a 404 if document is not found', (done) => {
    request(app)
      .get(`/lists/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done)
  });
  it('should return a document', (done) => {
    request(app)
      // to convert a Object to a string use: toHexString method
      .get(`/lists/${lists[0]._id.toHexString()}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.list.name).toBe(lists[0].name);
      })
      .end(done)
  });
});

describe('PATCH /lists/:id', () => {
  it('should update a list', (done) => {
    request(app)
      .patch(`/lists/${lists[0]._id.toHexString()}`)
      .send({
        name: "Jumbo"
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.list.name).toBe("Jumbo")
      })
      .end(done);
  });
  it('should not update a list when ID is invalid', (done) => {
    request(app)
      .patch(`/lists/${lists[1]._id.toHexString()}`)
      .send()
      .expect(200)
      .end(done)
  });
});

describe('DELETE /lists/:id', () => {
  it('should remove a list', (done) => {
    let hexId = lists[1]._id.toHexString();

    request(app)
      .delete(`/lists/${hexId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.list._id).toBe(hexId);
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        List.findById(hexId).then((list) => {
          // console.log(list);
          expect(list).toBe(null);
          done();
        }).catch((error) => done(error));
      });
  });
  it('should return a 404 if list wasnt found', (done) => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/lists/${hexId}`)
      .expect(404)
      .end(done)
  });
  it('should return a 404 if objectId is invalid', (done) => {
    request(app)
      .delete('/lists/1234')
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
        })
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
