import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class LandingContainer extends Component {
    constructor() {
        super();
        this.state = {
            url: ''
        };
    }

    componentDidMount() {
        this.setState({
            url: window.location.search.replace('?url=', '')
        });

    }

    render() {
        const { url } = this.state;
        return (
            <div >
                Once a day <br/>
                {url} already visited today
            </div>
        );
    }
}
export default LandingContainer;

document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.getElementById('landing-container');
    wrapper ? ReactDOM.render(<LandingContainer />, wrapper) : false;
});