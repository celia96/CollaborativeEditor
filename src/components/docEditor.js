import React, {Component} from 'react';
import { Editor, EditorState, SelectionState, RichUtils, convertToRaw, convertFromRaw, Modifier, CompositeDecorator } from 'draft-js';
// import createHighlightPlugin from 'draft-js-highlight-plugin';

const io = require('socket.io-client');

// Components
import ToolBar from './toolbar';
import DocumentHistory from './docHistory';
import Header from './editorHeader';
// import createHighlightPlugin from 'draft-js-highlight-plugin';

// Custom Styles
import styleMap from './stylemap';

export default class DocEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      docPortal: false,
      myColor: null,
      document: {},
      editors: [],
      history: [],
      search: '',
      replace: '',
      selection: SelectionState.createEmpty(),
      yourStyle: null,
      shareShow: false,
      cursorStyle: {}
    };
    // this.onChange = editorState => this.setState({ editorState });
    this.handleKeyCommand = () => this.handleKeyCommand;
  }

  updateSetState(editorState){
    this.setState({editorState: editorState})
  }

  componentDidMount() {
    var socket = this.props.socket;
    // const { socket } = this.state
    const user = JSON.parse(localStorage.getItem('user'));
    // console.log("Emitting document event, ", this.props.id);
    // socket.emit('document', {id: this.props.id, user: user, title: this.props.title});
    // socket.emit('document', this.props.id);
    // socket.emit('document', { document: this.props.doc, user: user, title: this.props.title, id: this.props.id, color: this.state.myColor });
    // call in document portal front-end side
    // socket.emit('addeditor', {title: this.props.title, editor: user.username})

    socket.on('document', (obj) => {
      console.log('Color us: ', obj.color);
      if (obj.doc.contents) {
        this.setState({
          document: obj.doc,
          user: user,
          // editors: obj.editors,
          editorState: EditorState.createWithContent(convertFromRaw({
            entityMap: {},
            blocks: obj.doc.contents.blocks,
          })),
          myColor: obj.color
        })
      } else {
        this.setState({
          user: user,
          document: obj.doc,
          // editors: obj.editors,
          myColor: obj.color
        })
      }
      console.log("TSDASD", this.state.myColor);
      // socket.emit('addeditor', {document: this.state.document, editor: this.state.user.username, color: obj.color})
    });


    socket.on('exit', obj => {
      // var array = this.state.editors.splice();
      // var index = array.indexOf(obj.editor);
      // array.splice(index, 1);
      // this.setState({
      //   editors: array
      // })
      this.props.exit();
      if (obj.message) {
        alert(obj.message);
      }
    })

    socket.on('editors', (editors) => {

      console.log("EDDDD", editors);
      this.setState({
        editors: editors
      })
      // console.log('ADASD');
      // if (this.state.editors.indexOf(editor) === -1) {
      //   console.log("state", this.state.editors);
      //   var arr = this.state.editors.slice();
      //   arr.push(editor);
      //   console.log("MY ED: ", arr);
      //   this.setState({
      //     editors: arr
      //   })
      // }
    })

    socket.on('history', (history) => {
      console.log(history);
      this.setState({ history });
    });

    socket.on('content', (content) => {

     var c = convertFromRaw(content.contentState);
     // console.log("C: ", c);
     var selectionState = SelectionState.createEmpty();
     var s = selectionState.merge(content.selectionState);
     // console.log("S: ", s);
     var mySelection = this.state.editorState.getSelection()
     //making cursor
     if (content.start === content.end) {

       //find x and y of mouse

       var e = EditorState.createWithContent(c);
       var edit = this.updateSetState(EditorState.forceSelection(e, s));
       var range = window.getSelection().getRangeAt(0);
       // let range = document.createRange(selection);

       this.updateSetState(EditorState.forceSelection(e, mySelection))
       // console.log('selection', selection)

       // range.selectNode(document.getElementById("editor"));
       let rect = range.getBoundingClientRect();
       // let rect = range.getClientRects();
       console.log('rect', rect)

       var modified = c;

       //set div styles for cursor
       this.setState({cursorStyle: {
         top: rect.top, bottom: rect.bottom,
         left: rect.left, right: rect.right,
         width: '4px',
         height: rect.height,
         backgroundColor: content.color, position: 'absolute'
       }})

     } else {
       var modified = Modifier.applyInlineStyle(c, s, content.inlineStyle.highlight);
       // console.log("Content: ", modified);
       var e = EditorState.createWithContent(modified);
       // console.log("E", e);
       // var s = this.state.editorState.getSelection();

       var newEditor = EditorState.forceSelection(e, mySelection);
       this.setState({
         editorState: newEditor,
         selection: s,
         yourStyle: content.inlineStyle.highlight
       })
     }
   })

   socket.on('save', (doc) => {
     this.setState({
       history: doc.history
     })
   })


   socket.on('errorMessage', message => {
     // YOUR CODE HERE (3)
     console.log(message);
     alert(message);
   });


   this.autoSave = setInterval(() => this.autosave(), 30000);
  }

  componentWillUnmount() {
    clearInterval(this.autoSave);
  }


  // Funtions
  // Editor Style Funtions
  makeEdit(value) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, value));
  }

  toggleBlock(value) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, value));
  }

  myBlockStyleFn(contentBlock){
    const type = contentBlock.getType();
    if (type === 'right') return 'rightAligned'
     else if (type === 'left') return 'leftAligned'
     else if (type === 'center') return 'centeredContent'
     else if (type === 'justify') return 'justify'
  }

  toggleBlockType(blockType){
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType))
  }

  handleKeyCommand(command, editorState) {
    console.log('here');
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  onChange(editorState) {
    console.log('in on change');


    let selectionState = editorState.getSelection();
    // console.log("Selection state: ", selectionState);
    let currentContent = editorState.getCurrentContent();
    let anchorKey = selectionState.getAnchorKey();
    let currentContentBlock = currentContent.getBlockForKey(anchorKey);
    let start = selectionState.getStartOffset();
    //console.log("Start: ", start);
    let end = selectionState.getEndOffset();
    //console.log("End: ", end);
    let selectedText = currentContentBlock.getText().slice(start, end);
    //console.log('selected: ', selectedText);

    // Real-time Content changes
    // Real-time Cursor loc changes

    // remove inline style
    console.log("State: ", this.state.selection);
    console.log("State: ", currentContent);
    console.log(": ", this.state.yourStyle);

    if (this.state.yourStyle) {
      var modified = Modifier.removeInlineStyle(currentContent, this.state.selection, this.state.yourStyle);
    } else {
      var modified = currentContent;
    }

    console.log("M: ", modified);
    // WILL CHANGE THE INLINESTYLE BE CONCAT BASED ON MYCOLOR
    this.props.socket.emit('content', {
      contentState: convertToRaw(modified),
      selectionState: selectionState,
      inlineStyle: {cursor: `CURSOR${this.state.myColor}`, highlight: `HIGHLIGHT${this.state.myColor}`},
      start: start,
      end: end,
      room: this.props.title,
      color: this.state.myColor
    })

    this.setState({
      editorState,
    })


  }

  // Different Function to implement autosave only when different
  autosave() {
    const currentContent = convertToRaw(this.state.editorState.getCurrentContent());
    if (this.state.history.length > 0 && !this.sameContent(currentContent.blocks,
      this.state.history[this.state.history.length - 1].blocks).different) {
      this.save();
    } else {
      console.log('Same Content')
    }
  }

  save() {
    if (this.state) {
      const currentContent = this.state.editorState.getCurrentContent();
      console.log('Save the content ', currentContent);
      const doc = this.props.doc._id;
      const user = JSON.parse(localStorage.getItem('user'));
      // fetch post request: save
      this.setState({ lastSaved: new Date() });
      this.props.socket.emit('save', { content: convertToRaw(currentContent), id: this.props.doc._id, user });
    }
  }

  handleSearch(e) {
    this.setState({
      search: e.target.value
    })
  }

  handleClose() {
    this.setState({ historyShow: false });
  }

  handleShow() {
    this.setState({ historyShow: true });
  }

  getHistory() {
    this.handleShow();
    this.props.socket.emit('history', { docId: this.props.doc._id, title: this.props.title });
  }

  restore(blocks) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.props.socket.emit('save', { content: { blocks }, id: this.props.doc._id, user });
    this.setState({ editorState: EditorState.createWithContent(convertFromRaw({
      entityMap: {},
      blocks,
      }))
    });
  }

  sameContent(blocksA, blocksB) {

    const diffs = {
      after: [],
      before: [],
    };

    let blocksShort = [];
    let blocksLonger = [];
    if (blocksB.length > blocksA.length) {
      blocksShort = blocksA;
      blocksLonger = blocksB;
    } else {
      blocksShort = blocksB;
      blocksLonger = blocksA;
    }

    const checks = (blocksShort.map((block, index) => (block.key === blocksLonger[index].key &&
        block.text === blocksLonger[index].text &&
        block.type === blocksLonger[index].type &&
        block.depth === blocksLonger[index].depth &&
        block.inlineStyleRanges.length ===
        blocksLonger[index].inlineStyleRanges.length &&
        ((block.inlineStyleRanges.length > 0) &&
        (blocksLonger[index].inlineStyleRanges.length > 0) ?
        block.inlineStyleRanges.map((style, j) => (
          style.offset === blocksLonger[index].inlineStyleRanges[j].offset &&
          style.length === blocksLonger[index].inlineStyleRanges[j].length &&
          style.style === blocksLonger[index].inlineStyleRanges[j].style))
          .reduce((a, b) => a && b) : true)
      )));

    checks.forEach((item, index) => {
      if (!item) {
        diffs.before.push(blocksA[index]);
        diffs.after.push(blocksB[index]);
      }
    });

    if (blocksB.length > blocksA.length) {
      diffs.after = diffs.after.concat(blocksB.slice(blocksA.length, blocksB.length));
    } else {
      diffs.after = diffs.after.concat(blocksA.slice(blocksB.length, blocksA.length));
    }

    return {
      different: checks.reduce((a, b) => a && b) && (blocksA.length === blocksB.length),
      differences: diffs,
    };
  }

  generateDecorator(highlightTerm){
    const regex = new RegExp(highlightTerm, 'g');
    return new CompositeDecorator([{
      strategy: (contentBlock, callback) => {
        if (highlightTerm !== '') {
          this.findWithRegex(regex, contentBlock, callback);
        }
      },
      component: this.SearchHighlight
    }])
  };

  findWithRegex(regex, contentBlock, callback){
    const text = contentBlock.getText();
    let matchArr, start, end;
    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index;
      end = start + matchArr[0].length;
      callback(start, end);
    }
};

  SearchHighlight(props) {
    return <span style={{backgroundColor: 'yellow'}} className="search-and-replace">{props.children}</span>
  }


  onChangeSearch(e){
      const search = e.target.value;
      this.setState({
        search,
        editorState: EditorState.set(this.state.editorState, { decorator: this.generateDecorator(search) }),
      });
    }

  onChangeReplace(e) {
    this.setState({
      replace: e.target.value,
    });
  }

  onReplace(){
    console.log(`replacing "${this.state.search}" with "${this.state.replace}"`);
    const regex = new RegExp(this.state.search, 'g');
    const { editorState } = this.state;
    const selectionsToReplace = [];
    const blockMap = editorState.getCurrentContent().getBlockMap();

    blockMap.forEach((contentBlock) => (
      this.findWithRegex(regex, contentBlock, (start, end) => {
        const blockKey = contentBlock.getKey();
        const blockSelection = SelectionState
          .createEmpty(blockKey)
          .merge({
            anchorOffset: start,
            focusOffset: end,
          });

        selectionsToReplace.push(blockSelection)
      })
    ));

    let contentState = editorState.getCurrentContent();

    selectionsToReplace.forEach(selectionState => {
      contentState = Modifier.replaceText(
        contentState,
        selectionState,
        this.state.replace,
      )
      this.props.socket.emit('content', {
        contentState: convertToRaw(contentState),
        selectionState: selectionState,
      })
    });

    this.setState({
      editorState: EditorState.push(
        editorState,
        contentState,
      )
    })


  }

  render() {
    // console.log('portal: ', this.state.docPortal);
    return (
      <div>
        <Header
          shareShow={this.state.shareShow}
          close={() => this.setState({ shareShow: false })}
          doc={this.props.doc}
          toggle={() => this.props.toggle(this.state.color)}
          open={() => this.setState({ shareShow: true })}
          editors={this.state.editors}
        />
        <div>
          <ToolBar
            edit={value => this.makeEdit(value)}
            toggleBlockType={value => this.toggleBlockType(value)}
            blockEdit={value => this.toggleBlock(value)}
            handleSearch={e => this.handleSearch(e)}
            searchValue={this.state.search}
            search={(e) => this.onChangeSearch(e)}
            replaceValue={this.state.replace}
            replace={(e) => this.onChangeReplace(e)}
            onReplace={() => this.onReplace()}
            save={() => this.save()}
            getHistory={() => this.getHistory()}
          />
        </div>
        <div id="editor" style={{ backgroundColor: '#dfdfdf', textAlign: this.state.align, marginLeft: -50, marginRight: -40, paddingTop: 50, overflowY: 'scroll', maxHeight: 360 }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #a9a9a9', margin: 50, padding: 60, paddingTop: 80 }}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange.bind(this)}
              handleKeyCommand={this.handleKeyCommand}
              customStyleMap={styleMap}
              blockStyleFn={this.myBlockStyleFn}
            />
          </div>
        </div>
        <p>Last Saved: <i>{this.state.lastSaved ? this.state.lastSaved.toTimeString() : ''}</i></p>
        <div id="cursor" style={this.state.cursorStyle}></div>
        {this.state.historyShow ? <DocumentHistory
          close={() => this.handleClose()}
          revisions={this.state.history.reverse()}
          open={() => this.handleShow()}
          show={this.state.historyShow}
          title={this.props.doc.title}
          hide={() => this.handleClose()}
          doc={this.props.doc}
          areDifferent={(a,b) => this.sameContent(a, b)}
          restore={blocks => this.restore(blocks)}
        /> : <div />}
      </div>
    );
  }
}
