import React from 'react';
import { InputGroup, FormGroup, Glyphicon, FormControl, Button, Row, Col } from 'react-bootstrap';


export default class StartBar extends React.Component{
  constructor(props){
    super(props);

  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={11} sm={11} md={11}><h1>DocumentPortal</h1></Col>
          <Col xs={1} sm={1} md={1} >
            <Button
              onClick={() => this.props.logout()}
              style={{ marginTop: 20 }}
            ><Glyphicon glyph="log-out" /></Button>
          </Col>
        </Row>
        <form>
          Start New Document
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Enter Name of Document"
                onChange={e => this.props.changeTitle(e)}
                value={this.props.title}
              />
              <InputGroup.Addon
                onClick={() => this.props.create()}
              >
                <Glyphicon glyph="file" />
              </InputGroup.Addon>
            </InputGroup>
          </FormGroup>
          Add Shared Document
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Enter ID of Document"
                onChange={e => this.props.changeShared(e)}
              />
              <InputGroup.Addon
                onClick={() => this.props.addShared()}
              >
                <Glyphicon glyph="plus" />
              </InputGroup.Addon>
            </InputGroup>
          </FormGroup>
        </form>
      </div>
    )
  }
}
