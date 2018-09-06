import React from 'react';
import { Editor, EditorState, convertFromRaw } from 'draft-js';
import { Modal, Alert, Grid, Row, Col, Button } from 'react-bootstrap';

import styleMap from './stylemap';

export default class DocHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      revisions: this.props.revisions,
      currVersion: this.props.revisions[0],
      index: 0,
    };
  }

  componentDidMount() {
    // this.setState({ currVersion: this.props.revisions[0] });
  }

  // restore() {
  //
  // }

  selectVersion(index) {
    if (index < this.state.revisions.length - 1 && this.state.revisions) {
      const diff = this.props.areDifferent(
        this.state.revisions[index + 1].blocks,
      this.state.revisions[index].blocks).differences;
      this.setState({ before: diff.before,
        after: diff.after,
        currVersion: this.state.revisions[index],
        index,
        toRestore: this.state.revisions[index].blocks
       });
        // this.setState({
        //   currVersion: this.state.revisions[index],
        //   index });
    } else {
      this.setState({ before: [],
        after: this.state.revisions[index],
        currVersion: this.state.revisions[index],
        index,
        toRestore: this.state.revisions[index].blocks
      });
    }
  }

  render() {
    const date = new Date();
    return (
        <Modal
          bsSize="large"
          aria-labelledby="contained-modal-title"
          show={this.props.show}
          onHide={() => this.props.hide()}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              History of {this.props.title} as of {date.toLocaleString()}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Grid>
              <Row className="show-grid">
                <Col xs={12} sm={6} md={7}>
                  <Row
                    className="show-grid"
                    style={{
                      paddingLeft: 20,
                      paddingRight: 20,
                      border: '1px solid gray',
                      borderRadius: 3,
                      overflowY: 'scroll',
                      maxHeight: 500,
                    }}
                  >
                    {this.state.currVersion ?
                      <Editor
                        editorState={EditorState.createWithContent(convertFromRaw({
                          entityMap: {},
                          blocks: this.state.currVersion.blocks,
                        }))}
                        customStyleMap={styleMap}
                        readOnly
                      />
                      : <div>
                        Hmm.....There should be something here.
                        Try reopening this section, I'm sure everything will be good.
                      </div>
                    }
                  </Row>
                  <Row className="show-grid" style={{ textAlign: 'center' }}>
                    <Col xs={9} sm={5} md={6}>
                      <h4>Added</h4>
                      {this.state.after && this.state.after.length > 0 ?
                        <Editor
                          editorState={EditorState.createWithContent(convertFromRaw({
                            entityMap: {},
                            blocks: this.state.after,
                          }))}
                          customStyleMap={styleMap}
                          readOnly
                        />
                        : <div>
                          No changes
                        </div>
                      }
                    </Col>
                    <Col xs={9} sm={5} md={6} style={{ borderLeft: '1px dashed gray' }}>
                      <h4>Removed</h4>
                      {this.state.before && this.state.before.length > 0 ?
                        <Editor
                          editorState={EditorState.createWithContent(convertFromRaw({
                            entityMap: {},
                            blocks: this.state.before,
                          }))}
                          customStyleMap={styleMap}
                          readOnly
                        />
                        : <div>
                          No changes
                        </div>
                      }
                    </Col>

                  </Row>

                </Col>
                <Col xs={12} sm={3} md={2} style={{ overflowY: 'scroll', maxHeight: 500 }}>
                  {(this.state.revisions ? this.state.revisions : this.props.revisions).map((doc, index) => {
                    return (
                      <Alert
                        bsStyle={(this.state.index === index) ? 'success' : 'warning'}
                        onClick={() => this.selectVersion(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <strong>{new Date(doc.time).toTimeString()}</strong>: by {doc.user.username}
                      </Alert>
                    );
                  })
                }
                </Col>
              </Row>
              <Row>
                <Button onClick={() => this.props.restore(this.state.toRestore)} >
                  Restore this Version
                </Button>
              </Row>
            </Grid>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.props.hide()}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
