import React, { Component } from 'react';

class AltWindow extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className="AltWindow">
                <h2> Station infomation </h2>
                <h3> {this.props.stationId} - {this.props.stationName}</h3>
                <hr />
                <ul className="stationInfo" dangerouslySetInnerHTML={{ __html: this.props.tramInbound }} ></ul>
                <ul className="stationInfo" dangerouslySetInnerHTML={{ __html: this.props.tramOutbound }} ></ul>
            </div>
        )
    }
}

export default AltWindow;