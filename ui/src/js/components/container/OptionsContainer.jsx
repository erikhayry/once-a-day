import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class OptionsContainer extends Component {
    constructor() {
        super();
        this.state = {
            whiteList: [],
            newWhiteListItem: '',
            error: ''
        };
        this.onInputChange = this.onInputChange.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onRemove = this.onRemove.bind(this);
        browser.storage.sync.get = browser.storage.sync.get.bind(this);
        browser.storage.sync.set = browser.storage.sync.set.bind(this);
    }

    restore(){
        browser.storage.sync.get('whiteList')
            .then((result) => {
                this.setState({
                    whiteList: result.whiteList || [],
                    newWhiteListItem: '',
                    error: ''
                });
            });
    }

    componentDidMount() {
        this.restore()
    }


    onInputChange(event) {
        this.setState({newWhiteListItem: event.target.value});
    }

    onRemove(index) {
        const { whiteList } = this.state;

        browser.storage.sync.set({
            whiteList: [...whiteList.slice(0, index), ...whiteList.slice(index + 1)]
        }).then(() => {
            this.restore()
        });
    }

    onSave() {
        const { whiteList, newWhiteListItem } = this.state;

        browser.storage.sync.set({
            whiteList: [...whiteList, newWhiteListItem]
        }).then(() => {
            this.restore()
        });
    }

    render() {
        const { whiteList, newWhiteListItem } = this.state;
        return (
            <div className="options-container">
                <h1>Once a day</h1>

                <h2>Whitelist</h2>

                <ul>
                    {whiteList.map((value, index) => (
                        <li key={`item-${index}`}>
                            {value}
                            <button onClick={() =>
                                this.onRemove(index)
                            }>Radera</button>
                        </li>)
                    )}
                </ul>

                <h2>Add url to whitelist</h2>

                <div className="form">
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="url"
                            value={newWhiteListItem}
                            onChange={this.onInputChange}
                        />
                    </div>
                    <button onClick={this.onSave}>Lägg till</button>
                </div>
            </div>
        );
    }
}
export default OptionsContainer;

const wrapper = document.getElementById("options-container");
wrapper ? ReactDOM.render(<OptionsContainer />, wrapper) : false;