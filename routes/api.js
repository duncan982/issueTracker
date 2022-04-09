'use strict';
const mongoose = require("mongoose");
// const moment = require("moment");

module.exports = function (app) {
  console.log("////////////////IT STARTS HERE//////////////////////////////////")

  const issues = new mongoose.Schema({
          issue_title: {type: String, required: true},
          issue_text: {type: String, required: true},
          created_on: "",
          updated_on: "",
          created_by: {type: String, required: true},
          assigned_to: "",
          open: {type: Boolean, default: true},
          // open: Boolean,
          status_text: "",
          project: ""
  });

  const Issues = mongoose.model('Issues', issues)
  
  app.route('/api/issues/:project')
  
    .get(async function (req, res){
    console.log("//////////////////////////////////////////////")
      let project = req.params.project;
      console.log("GET REQUEST: project_name", project)
      
      let requestQuery=req.query;
      console.log("requestQuery", requestQuery);
                                                

      // if request contains projectname and req.query
    if(project && Object.keys(requestQuery).length !== 0 || project && Object.keys(requestQuery).length === 0){

      // such issues based on  projectname and req.query
      
      let issue = await Issues.find({project: project, ...requestQuery});

      if(issue){
        console.log("issue", issue);
        res.json(issue)
      }
        }
    })
     
    .post(function (req, res){
 console.log("//////////////////////////////////////////////") 
      let project = req.params.project;
      // console.log(project)
      console.log("POST REQUEST:", project)
      // console.log(req.body);

      const {issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = req.body
      console.log("req.body", req.body)

      if(!issue_title || !issue_text || !created_by){
        // return error if post request doesnt have the required fields
        console.log('POST REQUEST: required field(s) missing')
        res.json({error: 'required field(s) missing'})
      }else{
        // create post if request have the required fields
        const postedIssue = new Issues({
          issue_title: issue_title,
          issue_text: issue_text,
          created_on: created_on || new Date().toISOString(),
          updated_on: updated_on || new Date().toISOString(),
          created_by: created_by,
          assigned_to: assigned_to || "",
          open: open==="closed" ? false : true,
          status_text: status_text || "",
          project: project
      })

        postedIssue.save();

      // console.log('postedIssue', postedIssue);
      // res.json({...postedIssue})
      // }

      let returnedPostedIssue = {
          assigned_to: postedIssue.assigned_to,
          status_text: postedIssue.status_text,
          open: postedIssue.open,
          _id: postedIssue._id,
          issue_title: postedIssue.issue_title,
          issue_text: postedIssue.issue_text,
          created_by: postedIssue.created_by,
          created_on: postedIssue.created_on,
          updated_on: postedIssue.updated_on
      }

        console.log("returnedPostedIssue", {...returnedPostedIssue})
      // res.json({...returnedPostedIssue})
      res.json(returnedPostedIssue)
      }
      
    })

    .put(async function (req, res){

      console.log("//////////////////////////////////////////////")
      
      let project = req.params.project;
      console.log("PUT request: project", project);
      let projectId = req.body._id
      console.log("projectId", projectId);
      console.log("req.body before _id deletion", req.body);


      if(projectId){ //check if request has an id
        let fieldsToUpdate = req.body
        console.log("fieldsToUpdate before deleting _id", fieldsToUpdate)
        // remove _id
        let fieldsToUpdate2 = delete fieldsToUpdate ["_id"]
        console.log("fieldsToUpdate  after deleting _id", fieldsToUpdate)
        console.log("req.body after _id deletion", req.body);
        
       if(Object.keys(fieldsToUpdate).length === 0){//check if request has fields to be updated, if none, return error 
          console.log("no update field(s) sent");
          res.json({ error: 'no update field(s) sent', '_id': projectId})
          } else if(Object.keys(fieldsToUpdate).length > 0){
        //check if request has fields to be updated if yes, search for issue in db and update
        // fieldsToUpdate = req.body; 

        // find issue to update for updation confirmation

        let upatedIssue = await  Issues.findByIdAndUpdate(projectId, {...fieldsToUpdate, updated_on: new Date().toISOString()});

          if(upatedIssue){
            // id is valid
            console.log("upatedIssue", upatedIssue);
            console.log(`${projectId} successfully updated`)
            res.json({
              result: 'successfully updated', 
              '_id': projectId
            });
          }else{
            console.log("could not update")
            res.json({error: "could not update", '_id': projectId})
          }
       }
       // else{
       //    res.json({error: 'could not update', _id: projectId})
       //    }
        
      }else{
      console.log(`missing _id,${projectId}`)
        res.json({error: 'missing _id'});
      };
    })

    .delete(async function (req, res){
      console.log("//////////////////////////////////////////////")
      
      let project = req.params.project;
      console.log("DELETE REQUEST", project)
      console.log("req.body", req.body)
      if(req.body._id){

        let deletedIssue = await Issues.findByIdAndDelete(req.body._id);

        if(deletedIssue){
          // On success
          // console.log("deletedIssue", deletedIssue);
          
          console.log(`successfully deleted, ${req.body._id}`);
            res.json({ result: 'successfully deleted', '_id': req.body._id});
        }else{
            // On failure
            console.log(`could not delete, ${req.body._id}`);
            res.json({ error: 'could not delete', '_id': req.body._id })
          }
      }else{
        console.log('missing _id');
        res.json({ error: 'missing _id' });
      }
    });

};
