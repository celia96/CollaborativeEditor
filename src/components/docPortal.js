import React from 'react';
import { EditorState } from 'draft-js';

// Components
import DocEditor from './docEditor';
import StartBar from './startBar';
import DocumentList from './documentList'

const prompt = require('electron-prompt');
const io = require('socket.io-client');


export default class DocPortal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      documents: [],
      title: '',
      docPortal: true,
      selectedDoc: {}
    };
    this.onChange = editorState => this.setState({ editorState });
  }
  componentDidMount() {
    fetch('http://localhost:8080/documents/', {
      method: 'GET',
    }).then(docsJ => docsJ.json())
    .then((docs) => {
      const user = JSON.parse(localStorage.getItem('user'));

      // Document Filter for documents user is owner or collaborator
      var userDocs = docs.filter(doc =>
        (doc.collaborators.indexOf(user.id) !== -1 || user.id === doc.owner));
      this.setState({
        documents: userDocs,
        user: user
      });
    });
  }

  handleTitle(e) {
    this.setState({
      title: e.target.value,
    })
  }

  onCreate() {
    // prompt password
    console.log("Create,", this.state.user.id);
    prompt({ title: 'Password Needed', label: 'Enter A Password' })
    .then((password) => {
      fetch(`http://localhost:8080/newDocument/${this.state.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.state.title,
          password: password
        })
      })
      .then(response => response.json())
      .then((responseJson) => {
        if (responseJson.success) {
          console.log('Successfully created doc');
          var docs = this.state.documents.slice();
          docs.push(responseJson.document);
          this.setState({
            documents: docs,
            selectedDoc: responseJson.document,
            selectedDocTitle: responseJson.document.title,
            selectedDocId: responseJson.document._id
          })

          this.props.socket.emit('document', { document: responseJson.document, user: this.state.user, title: responseJson.document.title, id: responseJson.document._id }, (color) => {
            this.props.socket.emit('addeditor', {document: responseJson.document, editor: this.state.user.username, color: color})
          });

          this.toggle();  // move to docEditor
        }
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
    });
  }


  viewDoc(id) {
    // call in document portal front-end side
    fetch(`http://localhost:8080/document/${id}/${this.state.user.id}`, {
      method: 'GET',
    }).then(response => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        this.setState({ selectedDoc: responseJson.document });
        console.log("VIEW");
        this.props.socket.emit('document', { document: responseJson.document, user: this.state.user, title: responseJson.document.title, id: responseJson.document._id }, (color) =>{
          this.props.socket.emit('addeditor', {document: responseJson.document, editor: this.state.user.username, color: color})
        });

        this.toggle();
      } else if (responseJson.passNeeded) {
        alert('You do not have access to this document');
      } else {
        console.log('fetching the document was unsuccessful');
      }
    }).catch(error => console.log('error', error));

  }

  onAddShared() {
    fetch(`http://localhost:8080/document/${this.state.sharedDocId}/${this.state.user.id}`, {
      method: 'GET',
    }).then(response => response.json())
    .then((responseJson) => {
      console.log('add shared',responseJson)
      if (responseJson.passNeeded) {
        const doc = responseJson.document;
        console.log(doc);
        prompt({ title: 'Password Needed', label: 'Enter Password for this document' })
        .then((password) => {
          if (password === doc.password) {
            var docCopy = JSON.parse(JSON.stringify(doc));
            docCopy.collaborators.push(this.state.user.id);
            console.log('DocCpy', docCopy);
            var docs = this.state.documents.slice();
            docs.push(docCopy);
            this.setState({ selectedDoc: docCopy, documents: docs});
            this.props.socket.emit('addshared', {document: docCopy, id: docCopy._id})
            this.props.socket.emit('document', { document: docCopy, user: this.state.user, title: docCopy.title, id: docCopy._id }, (color) => {
              console.log("C: ", color);
              this.props.socket.emit('addeditor', {document: docCopy, editor: this.state.user.username, color: color})
            });

            this.toggle();
          } else {
            alert('Password Was Incorrect');
          }
        })
      } else if (responseJson.success) {
        var docCopy = JSON.parse(JSON.stringify(responseJson.document));
        console.log('DocCpy', docCopy);
        // var docs = this.state.documents.slice();
        // docs.push(docCopy);
        // this.state.socket.emit('document', { document: docCopy, user: this.state.user, title: docCopy.title, id: docCopy._id });
        this.setState({ selectedDoc: docCopy });

        this.toggle();
      } else {
        alert('Document was not added');
      }
    })


  }

  toggle() {
    this.setState({ docPortal: false });
  }

  toPortal() {
    this.setState({ docPortal: true });
    this.props.socket.emit('exit', {doc: this.state.selectedDoc, editor: this.state.user.username});
  }

  exit() {
    this.setState({ docPortal: true });
  }

  logout() {
    fetch('http://localhost:8080/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      })
    })
    .then(response => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        console.log('Successfully logged out');
        localStorage.clear();
        this.props.toHome();  // move to Home
      }
    })
    .catch((err) => {
      console.log('Error: ', err);
    });
  }

  render() {
    return (
      <div style={{ paddingLeft: 40, paddingRight: 40 }}>
        {this.state.docPortal ?
          <div>
            <StartBar
              create={() => this.onCreate()}
              addShared={() => this.onAddShared()}
              changeTitle={e => this.handleTitle(e)}
              changeShared={e => this.setState({ sharedDocId: e.target.value })}
              title={this.state.title}
              logout={() => this.logout()}
            />
            <DocumentList documents={this.state.documents} view={id => this.viewDoc(id)} />
          </div>
        :
          <DocEditor
            toggle={() => this.toPortal()}
            doc={this.state.selectedDoc}
            id={this.state.selectedDoc._id}
            title={this.state.selectedDoc.title}
            socket={this.props.socket}
            exit={() => this.exit()}
          /> }
      </div>
    );
  }
}
