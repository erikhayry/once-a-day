const VERSION = '1.5.0';
Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
Sentry.configureScope((scope) => {
    scope.setTag("version", VERSION);
});

function handleResponse({ isVisitedToday, lastVisit, url } = {}) {
    if(isVisitedToday){
        window.location.href = `${url}?href=${encodeURIComponent(window.location.href)}&lastVisit=${lastVisit}`;
    }}

function handleError(error) {
    console.log(`Error: ${error}`);
}

browser.runtime.sendMessage({
    url: window.location.href
}).then(handleResponse, handleError);
