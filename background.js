function handleVisists(visits) {
    let message = 'not visited today';
    if(visits.length > 1){
        const lastVisit = moment(visits[visits.length - 2].visitTime);
        if(lastVisit.dayOfYear() === moment().dayOfYear()){
            message =  'already visited today'
        }
    }
    return message;
}

function listVisits({historyItems = [], whitelist = []}) {
    return new Promise((resolve, reject) => {
        if (historyItems.length && !whitelist.some((el) => historyItems[0].url.indexOf(el) > -1)) {
            browser.history.getVisits({
                url: historyItems[0].url
            }).then((visits) => {
                resolve(handleVisists(visits))
            }).catch((error) => {
                reject(error)
            });
        } else {
            resolve();
        }
    });
}

function getSettings() {
    return browser.storage.sync.get('whitelist');
}

function search({whitelist}){
    return new Promise((resolve, reject) => {
        browser.history.search({
            text: "",
            startTime: 0,
            maxResults: 1
        }).then((historyItems) => {
            resolve({historyItems, whitelist})
        }).catch((error) => {
            reject(error)
        });
    });
}

function add(whitelist = [], item){
    browser.storage.sync.set({
        whitelist: [...whitelist, item]
    }).then(() => {
        browser.notifications.create({
            'type': 'basic',
            'iconUrl': browser.extension.getURL('icons/logo@2x.png'),
            'title': 'Once a day',
            'message': `${item} added to whitelist`
        });
    })
}

function addToWhitelist(item){
        getSettings().then(({whitelist}) => add(whitelist, item))
}

function handleMessage() {
    return new Promise((resolve, reject) => {
        getSettings()
            .then(search)
            .then(listVisits)
            .then(resolve)
            .catch(reject);
    });
}


function handleBrowserAction(){
    browser.runtime.openOptionsPage();
}

function handleContextMenu({menuItemId, pageUrl}){
    switch (menuItemId) {
        case "add-to-whitelist":
            const host = new URL(pageUrl).host;
            addToWhitelist(host);
            break;
    }
}

/*
    Add context menu items
 */

browser.contextMenus.create({
    id: "add-to-whitelist",
    title: "Add to whitelist",
    contexts: ["all"]
});

browser.contextMenus.onClicked.addListener(handleContextMenu);
browser.browserAction.onClicked.addListener(handleBrowserAction);
browser.runtime.onMessage.addListener(handleMessage);