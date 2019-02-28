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