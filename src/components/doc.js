import React from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
// import io from '../server/index';
const io = require('socket.io-client');

import DocPortal from './docPortal';
import DocEditor from './docEditor';

// Components
export default class Doc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docPortal: true,
    };

  }

  componentDidMount() {
    const socket = io('http://127.0.0.1:8080');
    socket.on('connect', () => {
      console.log('ws connect');

    });
    socket.on('disconnect', () => { console.log('ws disconnect'); });
    socket.on('msg', (data) => {
      console.log('ws msg:', data);
      socket.emit('cmd', { foo: 123 });
    });
  }

  docsPortal(){
    this.setState({docPortal: !this.state.docPortal})
  }

  render() {
    console.log('portal: ', this.state.docPortal);
    return (
      <div>
      {this.state.docPortal ?
        <DocPortal toggle={() => this.docPortal()} /> :
        <DocEditor toggle={() => this.docPortal()} /> }
    </div>
    );
  }
}
