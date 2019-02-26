import browser from "webextension-polyfill";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
    SortableContainer,
    SortableElement,
    arrayMove,
} from 'react-sortable-hoc';
import { List, Segment, Button, Form, Divider, Container, Header, Message } from 'semantic-ui-react'

const INVALID_URL = 'invalid-url';

const SortableItem = SortableElement(({value, sortIndex, onRemove}) =>
    <List.Item>
        <List.Content style={{
            marginBottom: 10
        }}>
        {value}
        </List.Content>
        <List.Content floated='right'>
            <Button onClick={() =>
                onRemove(sortIndex)
            }>Radera</Button>
        </List.Content>
    </List.Item>);

const SortableList = SortableContainer(({items, onRemove}) => {
    return (
        <Segment>
            <List divided relaxed>
            {items.map((value, index) => (
                <SortableItem
                    key={`item-${index}`}
                    index={index} value={value}
                    onRemove={onRemove}
                    sortIndex={index}
                />
            ))}
            </List>
        </Segment>
    );
});

class OptionsContainer extends Component {
    constructor() {
        super();
        this.state = {
            whiteList: [],
            newWhiteListItem: '',
            error: ''
        };
        this.onInputChange = this.onInputChange.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
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

    onInputChange(e, { name, value }) {
        this.setState({[name]: value})
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

    onSortEnd({oldIndex, newIndex}) {
        this.setState(({whiteList = []}) => ({
            whiteList: arrayMove(whiteList, oldIndex, newIndex),
        }), () => {
            browser.storage.sync.set({
                whiteList: this.state.whiteList
            });
        });
    };

    render() {
        const { whiteList, newWhiteListItem, error } = this.state;
        return (
            <Container text>
                <Header as='h1'>Once a day</Header>

                <Divider />

                <SortableList items={whiteList} onSortEnd={this.onSortEnd} onRemove={this.onRemove}/>

                <Divider />

                <Form onSubmit={this.onSave} error={error === INVALID_URL}>
                    <Form.Field>
                        <Form.Input
                            placeholder='url'
                            name='newWhiteListItem'
                            label='Lägg till adress'
                            value={newWhiteListItem}
                            onChange={this.onInputChange}
                        />
                    </Form.Field>
                    {error === INVALID_URL && <Message
                        error
                        header='Fel format'
                        content='Webbadressen du försöker lägga till verkar vara i fel format.'
                    />}
                    <Form.Button floated='right' content='Lägg till' />
                </Form>
            </Container>
        );
    }
}
export default OptionsContainer;

const wrapper = document.getElementById("options-container");
wrapper ? ReactDOM.render(<OptionsContainer />, wrapper) : false;