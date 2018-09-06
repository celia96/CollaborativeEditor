import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import React from 'react';
import { EditorState } from 'draft-js';

// Express setup
import express from 'express';
import session from 'express-session';

const app = express();
// Socket IO setup
const server = require('http').Server(app);
const io = require('socket.io')(server);


// Databased (mlab) setup
const connect = process.env.MLAB;
mongoose.connect(connect);

const models = require('./models/models');

const User = models.User;
const Document = models.Document;

// Passport setup

const LocalStrategy = require('passport-local').Strategy;


// set passport middleware to first try local strategy
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// passport strategy
passport.use(new LocalStrategy((username, password, done) => {
  // Find the user with the given username
  User.findOne({ username: username }, (err, user) => {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.log(err);
      return done(err);
    }
    // if no user present, auth failed
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    // if passwords do not match, auth failed
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    // auth has has succeeded
    return done(null, user);
  });
}));

// connect passport to express via express middleware
app.use(passport.initialize());
app.use(passport.session());

const url = 'http://localhost:8080'

app.post('/signup', (req, res) => {
  // if (req.body.password === req.body.passwordRepeat && req.body.username && req.body.password) {
  console.log("USER: ", req.body);
  if (req.body.username && req.body.password) {
    new User({
      username: req.body.username,
      password: req.body.password,
    }).save()
      .then((user) => {
        res.json({success: true, id: user._id});
      })
      .catch((err) => {
        console.log("Error in signup: ", err);
        res.json({success: false})
      })
  } else {
    console.log("No username or password");
    res.json({success: false})
  }
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  User.findOne({ username: req.body.username, password: req.body.password })
  .exec((err, user) => {
    if (!user) {
      res.json({ success: false });
    }
    res.json({ success: true, user: user });
  });
});

app.post('/logout', (req, res) => {
  req.logout();
  res.json({success: true})
})

app.post('/newDocument/:user', (req, res) => {
  const colors = ['red', 'orange', 'yellow', 'blue', 'green', 'purple'];
  new Document({
    title: req.body.title,
    password: req.body.password,
    owner: req.params.user,
    colors: colors
  }).save()
    .then((doc) => {
      if (req.params.user) {
        res.json({ success: true, document: doc });
      } else {
        res.json({ success: false, message: 'user not logged in' });
      }

    })
    .catch((err) => {
      res.json({ success: false, error: err });
    })
})

app.get('/documents', (req, res) => {
  console.log('USER', req.user)
  Document.find()
    .then((docs) => {
      //console.log("DOCS: ", docs);
      res.send(docs);
    });
});

app.get('/document/:id/:user', (req, res) => {
  Document.findById(req.params.id)
    // .populate('collaborators')
    .then((doc) => {
      // fix this part
      if (doc.owner && (doc.collaborators.indexOf(req.params.user) !== -1 ||
         req.params.user === doc.owner._id)) {
        res.json({ success: true, passNeeded: false, document: doc });
      } else {
        // prompt document password on front end
        res.json({ success: true, passNeeded: true, user: req.params.user, document: doc });
      }
    })
    .catch((err) => {
      console.log('ERROR in loading a doc: ', err);
      res.json({ success: false })
    });
});

// Socket IO setup
server.listen(8080);



io.on('connection', (socket) => {
  console.log('connected');

  // Q: limit decreases every time : Load capacity
  // load document
  socket.on('document', (obj, fn) => {
    Document.findById(obj.id)
      .then((doc) => {
        if (doc) {
          socket.join(obj.title, () => {
            var room = io.sockets.adapter.rooms[obj.title];
            var rooms = io.sockets.adapter.rooms
            console.log("ROOM: ", room);
            console.log('Rooms: ', rooms);
            console.log('L:', room.length);
            if (room.length > 2) {
              socket.leave(obj.title);
              return socket.emit('exit', {message: 'Document cannot hold more than 6 editors', editor: obj.user.username})
            }
            console.log('Clients: ', Object.keys(room.sockets));
            console.log('Me: ', socket.id);

            io.to(obj.id, 'a new user has joined');
            var color = '';
            if (obj.color) {
              color = obj.color;
            } else {
              color = doc.colors.pop();
              doc.colors.unshift(color);
            }
            console.log("SENDING COLOR: ", color);
            socket.emit('document', {doc: doc, color: color});
            // io.in(obj.title).emit('editors', {editors: Object.keys(room.sockets), me: {id: socket.id, name: obj.user.username, color: color}});
            // io.in(obj.title).emit('editors', {editors: Object.keys(room.sockets)});

            // socket.emit('addeditor', {document: doc, editor: obj.user.username, color: color})

            // io.in(obj.document.title).emit('editors', obj.editors)

            console.log('save doc')

            // add me as an editor
            fn(color);
            return doc.save()
          });
        } else {
          console.log('Document is Null');
        }
      })
      .then((saved) => {
        console.log("SAVEEEED");
      })
      .catch(err =>  console.log('Could not get history', err));

  });

  // add shared
  socket.on('addshared', obj => {
    console.log("ADD SHARED");
    // console.log('obj: ', obj);
    Document.findById(obj.id)
      .then((doc) => {
        doc.collaborators = obj.document.collaborators;
        return doc.save();
      })
      .then((saved) => {
        console.log('Successfully saved ', saved);
      })
      .catch((err) => {
        console.log("ERROR in adding shared ", err);
      })
  })

  // add Editors
  socket.on('addeditor', obj => {
    console.log("ADD Editors", obj.editor);
    console.log(obj.document.title);
    // io.in(obj.document.title).emit('editors', obj.editors)

    // var room = io.sockets.adapter.rooms[obj.title];
    // console.log();
    console.log('COLOR: ', obj.color);
    Document.findById(obj.document._id)
      .then((doc) => {
        if (doc.editors.length === 0){
          doc.editors.push({editor: obj.editor, color: obj.color});
          console.log("doc editors", doc.editors);
        } else {
          for (var i = 0; i < doc.editors.length; i++) {
            if (doc.editors[i].editor !== obj.editor) {
              doc.editors.push({editor: obj.editor, color: obj.color});
              console.log("doc editors", doc.editors);
            }
          }
        }

        // if (doc.editors.indexOf(obj.editor) === -1) {
        //
        // }
        return doc.save();
      })
      .then((saved) => {
        io.in(obj.document.title).emit('editors', saved.editors)
      })
  })


  // content (doc's content, highlight, cursor)
  socket.on('content', content => {
    console.log('Content: ', content);
    socket.broadcast.to(content.room).emit('content', content)
  })

  // save
  socket.on('save', obj => {
    Document.findByIdAndUpdate(obj.id, { contents: obj.content })
      .then((doc) => {
        doc.history.push({
          time: new Date(),
          user: obj.user,
          blocks: obj.content.blocks,
        });
        doc.save();
        socket.emit('save', doc)
      });
  })

  // History
  socket.on('history', obj => {
    Document.findById(obj.docId, (err, doc) => {
      socket.emit('history', doc.history);
    })
    .catch(err =>  console.log('Could not get history', err));
  });

  socket.on('exit', obj => {
    // Document.find
    // ('EXIT')
    console.log("EXIT");
    var editor = obj.editor;
    console.log("Editor: ", editor);
    // socket.broadcast.to(obj.doc.title).emit('leave', {message: '', editor: editor});
    socket.emit('leave', {message: '', editor: editor});
    var client = io.sockets.adapter.rooms[obj.doc.title];
    console.log('Clients: ', client);

    // io.in(obj.title).emit('editors', {editors: Object.keys(room.sockets)});

    // Take them out of the editors
    Document.findById(obj.doc._id)
      .then((doc) => {
        var filtered = doc.editors.filter((item) => item.editor !== obj.editor);
        doc.editors = filtered;
        // if (doc.editors.indexOf(obj.editor) > -1) {
        //   doc.editors.splice(doc.editors.indexOf(obj.editor), 1);
        // }
        return doc.save();
      })
      .then((saved) => {
        console.log(obj.doc.title);
        io.in(obj.doc.title).emit('editors', saved.editors)
        socket.leave(obj.doc.title);
        console.log('Clients after: ', client);
      })

  })

});


export default io;
