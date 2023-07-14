(function (utmSource) { 
    localStorage.clear(); 
    _WF.cache.setItem("logging", "*").asPersistent(); 
    document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + `?utm_source=${utmSource}&utm_campaign=qa&utm_content=qa&utm_medium=qa&csplit=header&spallcontent=true&postcontent_ab=true`; 
})(localStorage.getItem("param1"));