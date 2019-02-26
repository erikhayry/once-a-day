function handleResponse(response) {
    console.log(response)
    if(response === 'already visited today'){
        document.body.style.opacity = 0.1
    }}

function handleError(error) {
    console.log(`Error: ${error}`);
}

browser.runtime.sendMessage({})
    .then(handleResponse, handleError);