import React from 'react';
import { InputGroup, FormGroup, ButtonGroup, Form, Jumbotron, Glyphicon, FormControl, Button, Row, Col } from 'react-bootstrap';

export default class Signup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      typedUsername: "",
      typedPassword: "",
      toLogin: false
    }
  }

  handleUsername(e) {
    this.setState({
      typedUsername: e.target.value,
    })
  }

  handlePassword(e) {
    this.setState({
      typedPassword: e.target.value,
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.typedUsername,
        password: this.state.typedPassword
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        console.log("Successfully signed up");
        this.props.toggle();
      }
    })
    .catch((err) => {
      console.log("Error: ", err);
    });

  }

  render() {
    return (
      <Jumbotron style={styles.jumbotron}>
        <h1 style={{textAlign: 'center'}}>Welcome to Horizons Docs</h1>
        <h3 style={{textAlign: 'center'}}>Register</h3>
        <Form horizontal onSubmit={(e) => this.handleSubmit(e)}>
          <FormGroup>
            <Col>
              Username
            </Col>
            <Col>
              <FormControl type="username" placeholder="Username" onChange={(e) => this.handleUsername(e)} value={this.state.typedUsername}/>
            </Col>
          </FormGroup>

          <FormGroup>
            <Col>
              Password
            </Col>
            <Col>
              <FormControl type="password" placeholder="Password" onChange={(e) => this.handlePassword(e)} value={this.state.typedPassword}/>
            </Col>
          </FormGroup>

          <FormGroup>
            <Col>
              <ButtonGroup>
                <Button  bsStyle="primary" type="submit" onClick={() => this.props.toggle()}>Go To Login</Button>
                <Button  bsStyle="success" type="submit">Register</Button>
              </ButtonGroup>
            </Col>
          </FormGroup>

        </Form>
      </Jumbotron>
    )
  }
}

const styles = {
  jumbotron: {
    borderRadius: 3,
    padding: '20px'
  }
}
