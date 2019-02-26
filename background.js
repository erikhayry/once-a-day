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

function listVisits({historyItems = [], whiteList = []}) {
    return new Promise((resolve, reject) => {
        if (historyItems.length && !whiteList.some((el) => historyItems[0].url.indexOf(el) > -1)) {
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
    return browser.storage.sync.get('whiteList');
}

function search({whiteList}){
    return new Promise((resolve, reject) => {
        browser.history.search({
            text: "",
            startTime: 0,
            maxResults: 1
        }).then((historyItems) => {
            resolve({historyItems, whiteList})
        }).catch((error) => {
            reject(error)
        });
    });
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

browser.runtime.onMessage.addListener(handleMessage);