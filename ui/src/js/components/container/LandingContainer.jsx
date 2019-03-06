import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Moment from 'react-moment';

class LandingContainer extends Component {
    constructor() {
        super();
        this.state = {
            url: '',
            lastVisit: '',
            host: ''
        };

        this.onWhitelistHost = this.onWhitelistHost.bind(this);

    }

    componentDidMount() {
        const { url, lastVisit } =  this.getSearch();
        const host = new URL(url).host;

        this.setState({
            url,
            host,
            lastVisit: parseFloat(lastVisit)
        });

    }

    getSearch(){
        let pairs = window.location.search.substring(1).split("&"),
            obj = {},
            pair,
            i;

        for ( i in pairs ) {
            if ( pairs[i] === "" ) continue;

            pair = pairs[i].split("=");
            obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
        }

        return obj;
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
        const { host, lastVisit } = this.state;

        return (
            <div className="page-container">
                <h1>Once <span>a</span> day</h1>
                <h2 style={{
                    textAlign: 'center'
                }}>{host} already visited today</h2>
                <h3 style={{
                    textAlign: 'center'
                }}>Last visit <Moment format="YYYY-MM-DD HH:mm">{lastVisit}</Moment></h3>
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