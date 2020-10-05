const VERSION = '1.0.0';
Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
Sentry.configureScope((scope) => {
    scope.setTag("version", VERSION);
});

const ALLOWED_BROWSING_TIME_IN_MINUTES = 20;

function visitsTodayFilter(visit) {
    const visitTime = visit.visitTime;
    return moment(visitTime).dayOfYear() === moment().dayOfYear()
}

function findEarlier(el, index, arr){
    const nextEl = arr[index + 1];
    const visitTime = el.visitTime;
    if(nextEl){
        const diff = moment(nextEl.visitTime).diff(moment(visitTime), 'minutes');

        return diff > ALLOWED_BROWSING_TIME_IN_MINUTES;
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
            url: browser.runtime.getURL('/dist/landing.html')
        };
    }

    return { isVisitedToday: false }
}

async function listVisits() {
    const url = await getUrl();
    const allowList = await getAllowList();
    const urlIsAllowed = url && allowList.some(allowListItem => url.indexOf(allowListItem) > -1);

    if(urlIsAllowed){
        return { isVisitedToday: false }
    }

    const origin = new URL(url).origin;
    const originVisits = await browser.history.getVisits({
        url: origin
    });
    const urlVisits = await browser.history.getVisits({
        url
    });
    const visits = originVisits.concat(urlVisits);

    return handleVisits(visits)
}

async function getAllowList(){
    const { whitelist = [] } = await browser.storage.sync.get('whitelist');

    return whitelist;
}

async function getUrl(){
    const historyItems =  await browser.history.search({
        text: "",
        startTime: 0,
        maxResults: 1
    });

    return historyItems && historyItems.length > 0 ? historyItems[0].url : undefined
}

async function checkHistory() {
    try {
        return await listVisits();
    } catch(e){
        console.error(e)
    }
}

function handleBrowserAction(){
    browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(handleBrowserAction);
browser.runtime.onMessage.addListener(checkHistory);
