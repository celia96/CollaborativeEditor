import React from 'react';
import { Glyphicon, Button, ButtonGroup } from 'react-bootstrap';


export default class DocumentList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showLastUpdate: false,
    };
  }

  render() {
    return (
      <div style={{
        backgroundColor: '#0057e7',
        marginLeft: -50,
        marginRight: -50,
        paddingLeft: 50,
        paddingTop: 30,
        height: 1000 }}
      >
        {this.props.documents.map((doc) =>
          (
            <ButtonGroup
              vertical
              onClick={() => this.props.view(doc._id)}
              style={{ marginRight: 20, width: 150 }}
            >
              <Button style={{ height: 150 }}>
                <Glyphicon glyph="file" />
                <hr />
                <p>{doc.title}</p>
                {doc.history && doc.history.length > 0 ?
                  <div>
                    <p style={{ fontSize: 10 }}>Last Update by {doc.history[doc.history.length - 1].user.username}</p>
                    <p style={{ fontSize: 10 }}>On {new Date(doc.history[doc.history.length - 1].time).toDateString()}</p>
                  </div> :
                  <p style={{ fontSize: 10 }}>No recent Changes</p>
                }
              </Button>
            </ButtonGroup>
            )
          )
        }
      </div>

    )
  }
}
