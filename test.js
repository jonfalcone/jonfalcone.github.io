let utm_source;
chrome.storage.local.get(["param1"]).then((result) => {
    utmSource = result.key;
});
(function (source) { 
    localStorage.clear(); 
    _WF.cache.setItem("logging", "*").asPersistent(); 
    document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + `?utm_source=${source}&utm_campaign=qa&utm_content=qa&utm_medium=qa&csplit=header&spallcontent=true&postcontent_ab=true`; 
})(utmSource);