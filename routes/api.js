/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').find().toArray((err, docs) => {
          docs = docs.map(item => 
            ({title: item.title,
              _id: item._id,
              commentcount: item.comments.length})
          )
          res.json(docs)
          db.close()
        })
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (title === '') return res.json('missing title');
      let book = {title: title, comments: []}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').insertOne(book, (err, docs) => {
          res.json(docs.ops[0])
          db.close()
        })
      });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').remove({}, (err, docs) => {
          if (err) throw err;
          console.log(docs.result.ok)
          if (docs.result.ok == 1) res.json('complete delete successful')
          db.close()
        })
      });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.json('no book exists');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').findOne({_id: ObjectId(bookid)}, (err, docs) => {
          if (err) throw err;
          res.json(docs !== null ? docs : 'no book exists')
          db.close()
        })
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.json('invalid id');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').findOneAndUpdate({_id: ObjectId(bookid)}, {$push: {comments: comment}}, {returnOriginal: false}, (err, docs) => {
          if (err) throw err;
          console.log(docs.value)
          res.json(docs.value)
          db.close()
        })
      });
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
    
      try {
        ObjectId(bookid)
      } catch(err) {
        return res.json('invalid id');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('books').remove({_id: ObjectId(bookid)}, (err, docs) => {
          if (err) throw err;
          if (docs.result.ok) res.json('delete successful')
          db.close()
        })
      });
      //if successful response will be 'delete successful'
    });
  
};
