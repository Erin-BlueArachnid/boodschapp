const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {List} = require('../models/list');

const lists = [{
  name: "Aldi"
}, {
  name: "Albert Heijn"
}];

// beforeEarch is a testing lifecycle method
// runs this code before every testcase
beforeEach((done) => {
  List.remove({}).then(() => {
    // return makes it possible to chain callbacks
    return List.insertMany(lists);
  }).then(() => done());
});

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
