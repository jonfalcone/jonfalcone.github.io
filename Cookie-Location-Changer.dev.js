// Set/Update Location with cookies
function MyPrompt() {
    return new Promise((resolve, reject) => {
        let dialog = document.createElement("dialog");
        dialog.setAttribute("id", "cookie_dialog");
        dialog.innerHTML = `
        <form>
            <label for="newUtmSource">UTM Source:</label>
            <input class="text_input" type="text" value="" style="border:1px solid black" id="newUtmSource"/>
            <br>
            <label for="newGeo">GEO Code (US || DE || JP):</label>
            <input class="text_input" type="text" value="US" style="border:1px solid black" id="newGeo" required/>
            <br>
            <label for="newState">State Code (CA || TX):</label>
            <input class="text_input" type="text" value="CA" style="border:1px solid black" id="newState"/>
            <br>
            <label for="newCity">City:</label>
            <input class="text_input" type="text" value="SANDIEGO" style="border:1px solid black" id="newCity"/>
            <br>
            <label for="shouldSetLiveramp">Set Liveramp </label>
            <input class="radio_input" type="Checkbox" id="shouldSetLiveramp" />
            <br>
            <label for="shouldSetQuantcast">Set Quantcast </label>
            <input class="radio_input" type="Checkbox" id="shouldSetQuantcast"/>
            <br>
            <label for="shouldSetConsentManager">Set ConsentManager </label>
            <input class="radio_input" type="Checkbox" id="shouldSetConsentManager"/>
            <br>
            <label for="shouldEnableLogging">Enable console logging </label>
            <input class="radio_input" type="Checkbox" id="shouldEnableLogging"/>
            <br>
            <label for="shouldClearLocalStorage">Clear localStorage </label>
            <input class="radio_input" type="Checkbox" id="shouldClearLocalStorage" checked/>
            <br>
            <label for="shouldReload">Reload page on submit </label>
            <input class="radio_input" type="Checkbox" id="shouldReload" checked/>
            <br>
            <br>
            <button id="saveOrSubmit" type="submit">Submit</button>
            <button id="exitButton" style="margin-left:10px"; type="button">Exit</button>
        </form>`;
        document.body.appendChild(dialog);
        if(bookmarkletSetup)
        {
            var saveButton = document.getElementById("saveOrSubmit");
            saveButton.name = "Save";
        }
        dialog.showModal();
        dialog.querySelector("form").addEventListener("submit", (e) => {
            e.preventDefault();
            dialog.remove();
            var inputs = {};
            [...dialog.querySelectorAll("input")].forEach(input => inputs[input.id] = (input.type == "text" ? input.value : input.checked));
            resolve(inputs);
        });
        var exitButton = document.getElementById("exitButton");
        exitButton.onclick = function() {
            dialog.remove();
            resolve(-1);
        };
    });
}
(async function() {
    const currentScript = document.currentScript;
    const params = currentScript.getAttribute('params');
    const bookmarkletSetup = currentScript.getAttribute('bookmarkletSetup');
    const attrNames = currentScript.getAttributeNames();

    if (document.getElementById('cookie_dialog')) {
        document.getElementById('cookie_dialog').remove();
        return;
    }

    var newSettings;
    if(!params)
    {
        newSettings = await MyPrompt();
    }
    else
    {
        newSettings = params;
    }

    function qaLog(msg, obj) {
        obj = obj || '';
        console.log('QA> ', msg, obj);
    }

    function enableLogging() {
        localStorage.hmk_logging = "*";
    }

    function rebuildUrl(url) {
        document.location = url;
    }
    var updateSettings = function(newSettings) {
        if (newSettings.shouldClearLocalStorage) {
            localStorage.clear();
        }
        if (newSettings.newGeo) {
            if (newSettings.newState && newSettings.newCity) {
                setGeo(newSettings.newGeo, newSettings.newState, newSettings.newCity);
            } else if (newSettings.newState) {
                setGeo(newSettings.newGeo, newSettings.newState);
            } else if (newSettings.newCity) {
                setGeo(newSettings.newGeo, "", newSettings.newCity);
            } else {
                setGeo(newSettings.newGeo);
            }
        }
        if (newSettings.shouldEnableLogging) {
            setTimeout(enableLogging, 100);
        }
        if (newSettings.shouldReload) {
            var url = document.location.protocol + "//" + document.location.host + document.location.pathname;
            if (newSettings.newUtmSource) {
                url += "?utm_source=" + newSettings.newUtmSource + "&utm_campaign=qa";
            } else {
                url += document.location.search;
            }
            if (newSettings.shouldSetLiveramp) {
                url += "&cmp_ab=liveramp";
            } else if (newSettings.shouldSetQuantcast) {
                url += "&cmp_ab=quantcast";
            } else if (newSettings.shouldSetConsentManager) {
                url += "&cmp_ab=cmgr";
            }
            setTimeout(function() { rebuildUrl(url) }, 200);
        } else {
            if (newSettings.newUtmSource) {
                _WF.cache.setItem(_WF.KEYS.UTMSOURCE, newSettings.newUtmSource).asPersistent();
                _WF.cache.setItem(_WF.KEYS.UTMCAMPAIGN, "qa").asPersistent();
            }
            if (newSettings.shouldSetLiveramp) {
                _WF.cache.setItem(_WF.KEYS.TAGMAN_PREFIX + "cmp_ab", "liveramp", true).asPersistent()
            } else if (newSettings.shouldSetQuantcast) {
                _WF.cache.setItem(_WF.KEYS.TAGMAN_PREFIX + "cmp_ab", "quantcast", true).asPersistent()
            } else if (newSettings.shouldSetConsentManager) {
                _WF.cache.setItem(_WF.KEYS.TAGMAN_PREFIX + "cmp_ab", "cmgr", true).asPersistent()
            }
        }
    };

    function setGeo(geo, state = "", city = "") {
        const dynamicGeo = {
            cityCode: city.toUpperCase(),
            countryCode: geo.toUpperCase(),
            metroCode: 825,
            regionCode: state.toUpperCase(),
        };
        Object.keys(dynamicGeo).forEach((k) => {
            _WF.cookieStore.removeItem(k);
            _WF.cookieStore.setItem(k, dynamicGeo[k]);
        });
        delete localStorage.gdprDisplayed;
        const locationInfo = _WF.cache.json.get(_WF.KEYS.LOCATION) || {};
        locationInfo.country_code = dynamicGeo.countryCode;
        locationInfo.region_code = dynamicGeo.regionCode;
        locationInfo.city = dynamicGeo.cityCode;
        _WF.cache.json.set(_WF.KEYS.LOCATION, locationInfo);
        _WF.cache.removeItem('hmk_cmp_result');
        qaLog('set loc>', locationInfo);
    }
    updateSettings(newSettings);
})();
