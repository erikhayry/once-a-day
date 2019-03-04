const VERSION = '1.0.0';
Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
Sentry.configureScope((scope) => {
    scope.setTag("version", VERSION);
});

function handleResponse({message, url}) {
    console.log(message, url)
    if(message === 'already visited today'){
        window.location.href = `${url}?url=${window.location.href}`
    }}

function handleError(error) {
    console.log(`Error: ${error}`);
}

browser.runtime.sendMessage({})
    .then(handleResponse, handleError);