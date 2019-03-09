const VERSION = '1.0.0';
Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
Sentry.configureScope((scope) => {
    scope.setTag("version", VERSION);
});

const ALLOWED_BROWSING_TIME = 0;

function visitsTodayFilter(visit) {
    const visitTime = visit.visitTime;

    return moment(visitTime).dayOfYear() === moment().dayOfYear()
}

function findEarlier(el, index, arr){
    const nextEl = arr[index + 1];
    const visitTime = el.visitTime;
    if(nextEl){
        const diff = moment(nextEl.visitTime).diff(moment(visitTime), 'minutes');

        return diff > ALLOWED_BROWSING_TIME;
    }

    return false;
}

function handleVisits(visits = []) {
    const visitsToday = visits.filter(visitsTodayFilter);
    const earlierVisit = visitsToday.find(findEarlier);

    if(earlierVisit){
        const visitTime = earlierVisit.visitTime;
        return {
            lastVisit: visitTime,
            isVisitedToday: true,
            url: browser.runtime.getURL('/ui/dist/landing.html')
        };

    }

    return {};
}

function listVisits({historyItems = [], whitelist = []}) {
    return new Promise((resolve, reject) => {
        if (historyItems.length && !whitelist.some((el) => historyItems[0].url.indexOf(el) > -1)) {
            const origin = new URL(historyItems[0].url).origin;
            browser.history.getVisits({
                url: origin
            }).then((visits) => {
                resolve(handleVisits(visits))
            }).catch((error) => {
                reject(error)
            });
        } else {
            resolve({});
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

browser.browserAction.onClicked.addListener(handleBrowserAction);
browser.runtime.onMessage.addListener(handleMessage);