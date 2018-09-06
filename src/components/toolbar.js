import React from 'react';
import { ButtonGroup, Button, ButtonToolbar, Glyphicon, Navbar, FormGroup, FormControl } from 'react-bootstrap';
import FontSizeSelect from './fontSizeSelect';
import FontColourSelect from './fontColourSelect';
import { EditorState, RichUtils } from 'draft-js';


// Components

export default class ToolBar extends React.Component {
  constructor(props) {
    super(props);
  }

  onFontSizeChange(value) {
    this.props.edit(`FONTSIZE${value}`);
  }

  onFontColourChange(value) {
    this.props.edit(`FONTCOLOR${value}`);
  }

  render() {
    console.log("TOOLBAR");
    return (
      <div style={{ marginTop:  20 }}>
        <Navbar>

          <Navbar.Form pullLeft>
            <FormGroup>
              <FormControl type="text" placeholder="Find in Document" onChange={(e) => this.props.search(e)} value={this.props.searchValue}/>
              <FormControl type="text" placeholder="Replace" onChange={(e) => this.props.replace(e)} value={this.props.replaceValue}/>
            </FormGroup>{' '}
            <Button type="submit" onClick={() => this.props.onReplace()}>Replace</Button>
          </Navbar.Form>
          <Navbar.Form pullRight>
            <Button onClick={() => this.props.save()} >Save Changes</Button>
            <Button onClick={() => this.props.getHistory()} >History</Button>
          </Navbar.Form>

        </Navbar>
        <ButtonToolbar>
          <ButtonGroup>
            <Button onClick={() => this.props.edit('BOLD')}><bold>B</bold></Button>
            <Button onClick={() => this.props.edit('ITALIC')}><i>I</i></Button>
            <Button onClick={() => this.props.edit('UNDERLINE')}>
              <underline>U</underline>
            </Button>
            <Button onClick={() => this.props.edit('STRIKETHROUGH')}>Strikethrough</Button>
            <Button onClick={() => this.props.toggleBlockType('left')}>
              <Glyphicon glyph="align-left" />
            </Button>
            <Button onClick={() => this.props.toggleBlockType('center')}>
              <Glyphicon glyph="align-center" />
            </Button>
            <Button onClick={() => this.props.toggleBlockType('right')}>
              <Glyphicon glyph="align-right" />
            </Button>
            <Button onClick={() => this.props.toggleBlockType('justify')}>
              <Glyphicon glyph="align-justify" />
            </Button>
            <Button onClick={() => this.props.toggleBlockType('unordered-list-item')}>
              <Glyphicon glyph="th-list" />
            </Button>
            <Button onClick={() => this.props.toggleBlockType('ordered-list-item')}>
              <Glyphicon glyph="sort-by-order" />
            </Button>
            <FontSizeSelect edit={value => this.onFontSizeChange(value)} />
            <FontColourSelect edit={value => this.onFontColourChange(value)} />
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    );
  }
}
