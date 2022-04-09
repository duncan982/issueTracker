const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

suite('Functional Tests', function() {
  this.timeout(5000)
  suite('Integration tests with chai-http', function(){

    let projectIssues=[]

  test(" #1 Create an issue with every field: POST request to /api/issues/{project}", function(done){
  // create object for request
      let postRequest = {
        issue_title: "test1",
        issue_text: "testing issue1",
        created_by: "mimi1",
        assigned_to: "mimi1",
        open: "open",
        status_text: "testing 1",
        project: "test1"
      };

      // remove project key to pass assertion
      let postRequest2 = delete postRequest["project"];
    chai
    .request(server)
    .post('/api/issues/test1')
    .type("form")
    .send({...postRequest})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepInclude(res.body, {...postRequest2});
      done();
    })
  });
    test('#2 Create an issue with only required fields: POST request to /api/issues/{project}', function(done){
      // create object for request
      let postRequest = {
        // _method: "post",
        issue_title: "test2",
        issue_text: "testing issue2",
        created_by: "mimi2",
        project: "test2"
      };

      // remove project key to pass assertion
      let postRequest2 = delete postRequest["project"];
      chai
      .request(server)
      .post('/api/issues/test2')
      .type('form')
      .send({...postRequest})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepInclude(res.body, {...postRequest2})
        done();
      })
    });
    
    test("#3 Create an issue with missing required fields: POST request to /api/issues/{project}", function(done){
      // create object for request
      let postRequest = {
        project: "test3"
      };

      // remove project key to pass assertion
      let postRequest2 = delete postRequest["project"];
      
      chai
      .request(server)
      .post('/api/issues/test3')
      .type('form')
        .send({...postRequest})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepStrictEqual(res.body, {"error":"required field(s) missing"})
        done();
      })
    });
    
    test("#4 View issues on a project: GET request to /api/issues/{project}", function(done){
      // created object for request
      let postRequest = {
        issue_title: "test2",
        issue_text: "testing issue2",
        created_by: "mimi2",
        project: "test2"
      };

      chai
      .request(server)
      .get('/api/issues/test2')
      .end(function(err, res){
        projectIssues.push(res.body)// collect projetc to delete in test #12
        assert.equal(res.status, 200);
        // console.log(res.body)
        // assert.deepInclude(res.body, {...postRequest2})
        assert.deepInclude(res.body[0], {...postRequest})
        done();
      })
    });    
  
  test("#5 View issues on a project with one filter: GET request to /api/issues/{project}", function(done){
      // created object for request
      let postRequest = {
        issue_title: "test2",
        issue_text: "testing issue2",
        created_by: "mimi2",
        project: "test2"
      };

    chai
    .request(server)
    .get('/api/issues/test2?created_by=mimi2')
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepInclude(res.body[0], {...postRequest})
      done();
    })
  });
    
test("#6 View issues on a project with multiple filters: GET request to /api/issues/{project}", function(done){
      // created object for request
      let postRequest = {
        issue_title: "test2",
        issue_text: "testing issue2",
        created_by: "mimi2",
        project: "test2"
      };

      // remove project key to pass assertion
      // let postRequest2 = delete postRequest["project"];
    chai
    .request(server)
    .get('/api/issues/test2? issue_title=test2&created_by=mimi2')
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepInclude(res.body[0], {...postRequest})
      done();
    })
  });
    
  test("#7 Update one field on an issue: PUT request to /api/issues/{project}", function(done){
    chai
    .request(server)
    .put('/api/issues/test2')
    .send({issue_text: "testing issue3", _id: "624dac4d2fb17c4a00264084"})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepStrictEqual(res.body, {result: 'successfully updated', '_id': "624dac4d2fb17c4a00264084"})
      done();
    })
  });
    
  test("#8 Update multiple fields on an issue: PUT request to /api/issues/{project}", function(done){
    chai
    .request(server)
    .put('/api/issues/test2')
    .send({issue_text: "testing issue4", issue_title: "test4", _id: "624dac4d2fb17c4a00264084"})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepStrictEqual(res.body, {result: 'successfully updated', '_id': "624dac4d2fb17c4a00264084"})
      done();
    })
  });

  test("#9 Update an issue with missing _id: PUT request to /api/issues/{project}", function(done){
    chai
    .request(server)
    .put('/api/issues/test2')
    .send({issue_text: "testing issue5", issue_title: "test5",})
    .end(function(res, err){
      assert.equal(res, null);
      done();
    })
  });
  
  test("#10 Update an issue with no fields to update: PUT request to /api/issues/{project}", function(done){
    chai
    .request(server)
    .put('/api/issues/test2')
    .send({ _id: "624dac4d2fb17c4a00264084"})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepStrictEqual(res.body, {
         error: "no update field(s) sent",
        _id: "624dac4d2fb17c4a00264084"
      });
      done();
    })
  });

  test("# 11  Update an issue with an invalid _id: PUT request to /api/issues/{project}", function(){
    chai
    .request(server)
    .put('/api/issues/test2')
    .send({issue_text: "testing with invalid id", _id: "624a79391ff50e49c9e9c14"})
    .end(function(err, res){
      assert.throws(()=>{assert.deepStrictEqual(res.body, {error: "could not update", _id: "624a79391ff50e49c9e9c14"})}, Error)
      // done();
    })
  })

  test("#12 Delete an issue: DELETE request to /api/issues/{project}", function(done){
    // console.log("projectIssues", projectIssues[0])
// select 1 issue to delete
const obtainedValues = []
for (const [key, values] of Object.entries(projectIssues[0])){
    // console.log(values)
    obtainedValues.push(values)
}
// console.log(obtainedValues[-1]);
let idForIssueToBeDeleted = obtainedValues[obtainedValues.length-1]._id
    // console.log('idForIssueToBeDeleted', idForIssueToBeDeleted)

    chai
    .request(server)
    .delete('/api/issues/{test2}')
    .send({_id:`${idForIssueToBeDeleted}`})
    .end(function(err, res){
      assert.equal(res.status, 200)
      assert.deepStrictEqual(res.body, {result: 'successfully deleted', '_id': `${idForIssueToBeDeleted}`})
      done();
    }) 
  })
    
  test("#13 Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function(done){
    chai
    .request(server)
    .delete('/api/issues/test2')
    .send({_id:"624a897088cd7ad0958647de"})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepStrictEqual(res.body, {error: 'could not delete', '_id':"624a897088cd7ad0958647de"})
      done()
    })
  });
  test("#14 Delete an issue with missing _id: DELETE request to /api/issues/{project}", function(done){
    chai
    .request(server)
    .delete('/api/issues/test2')
    .send({})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.deepStrictEqual(res.body, {error: 'missing _id' })
      done();
    })
  });
    
  })
  
});
