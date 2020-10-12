const VERSION = '1.5.0';
Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
Sentry.configureScope((scope) => {
    scope.setTag("version", VERSION);
});
const MINUTE = 1000 * 60;
const ALLOWED_BROWSING_TIME_IN_MINUTES = 20 * MINUTE;

async function handleVisits() {
    const url = await getUrl();
    const allowList = await getAllowList();
    const urlIsAllowed = url && allowList.some(allowListItem => url.indexOf(allowListItem) > -1);

    if(urlIsAllowed){
        return { isVisitedToday: false }
    }

    const origin = new URL(url).origin;
    const offset = new Date().getTimezoneOffset() * MINUTE;
    const startTime = new Date().setHours(0,0,0,0) + offset;
    const endTime = new Date().getTime() - ALLOWED_BROWSING_TIME_IN_MINUTES + offset;
    const originVisitsSearch = await browser.history.search({
        text: origin,
        startTime,
        endTime
    });

    const visitsWithSameOrigin = originVisitsSearch
        .filter(visit => new URL(visit.url).origin === origin)
        .sort((a, b) => a.lastVisitTime - b.lastVisitTime)

    if(visitsWithSameOrigin.length > 0){
        return {
            lastVisit: visitsWithSameOrigin[0].lastVisitTime,
            isVisitedToday: true,
            url: browser.runtime.getURL('/dist/landing.html')
        };
    }

    return { isVisitedToday: false }
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

    if(historyItems && historyItems.length > 0){
        const parsedUrl = new URL(historyItems[0].url)

        return parsedUrl.origin + parsedUrl.pathname
    }

    return undefined
}

async function checkHistory() {
    try {
        return await handleVisits();
    } catch(e){
        console.error(e)
    }
}

function handleBrowserAction(){
    browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(handleBrowserAction);
browser.runtime.onMessage.addListener(checkHistory);
