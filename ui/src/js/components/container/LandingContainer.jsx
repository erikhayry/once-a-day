import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class LandingContainer extends Component {
    constructor() {
        super();
        this.state = {
            url: ''
        };

        this.onWhitelistHost = this.onWhitelistHost.bind(this);

    }

    componentDidMount() {
        const url =  window.location.search.replace('?url=', '');
        const host = new URL(url).host;

        this.setState({
            url, host
        });

    }

    getWhitelist(){
        return browser.storage.sync.get('whitelist')
    }

    setWhitelistItem(whitelist){
        return browser.storage.sync.set({whitelist})
    }

    onWhitelistHost(){
        const { url, host } = this.state;

        this.getWhitelist()
            .then(({whitelist = []}) => this.setWhitelistItem([...whitelist, host]))
            .then(() => {
                window.location.href = url;
            });
    }

    render() {
        const { host } = this.state;

        return (
            <div className="page-container">
                <h1>Once <span>a</span> day</h1>

                <h2>{host} already visited today</h2>
                <div className="action-container">
                    <button className="action-btn" onClick={this.onWhitelistHost}>Whitelist website</button>
                </div>
            </div>
        );
    }
}
export default LandingContainer;

document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.getElementById('landing-container');
    wrapper ? ReactDOM.render(<LandingContainer />, wrapper) : false;
});