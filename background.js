function gotVisits(visits, sendResponse) {
    console.log("Visit count: " + visits.length);
    let message = 'not visited today';
    if(visits.length > 1){
        const lastVisit = moment(visits[visits.length - 2].visitTime);
        if(lastVisit.dayOfYear() === moment().dayOfYear()){
            message =  'already visited today'
        }
    }
    console.log(message)
    sendResponse(message)
}

function listVisits(historyItems, sendResponse) {
    if (historyItems.length) {
        console.log("URL " + historyItems[0].url);
        var gettingVisits = browser.history.getVisits({
            url: historyItems[0].url
        });
        gettingVisits.then((visits) => {
            gotVisits(visits, sendResponse)
        });
    }
}



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        var searching = browser.history.search({
            text: "",
            startTime: 0,
            maxResults: 1
        });

        searching.then((historyItems) => {
            listVisits(historyItems, sendResponse)
        });

        return true;
    });
