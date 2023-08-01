/* 
 * Parameters 
 * 1. utm source
 */

async function apisBookmarklet(params, mode) 
{
    if (!params) {
        params = await showBookmarkletModal();
    }

    if(mode == "run")
    {
        runBookmarklet(params[0]);
    }

    return params;
}

function showBookmarkletModal() 
{
    return new Promise(resolve => { 
        let dialog = document.createElement("dialog"); 
        dialog.setAttribute("id", "dialog"); 
        dialog.innerHTML = 
            `<form>
                <label for="ptext">UTM Source:</label>
                <input class="input" type="text" onclick="this.select()"/>
                <button type="submit">Save</button>
                <button style="margin-left:10px"; type="button" onclick="(function(){document.getElementById('dialog').remove();})();")>Exit</button>
            </form>`; 
        //dialog.querySelector('button[type="submit"]').addEventListener()
        dialog.addEventListener("submit", function(){
            resolve([ dialog.getElementsByClassName("input")[0].value ]);
        })
        document.body.appendChild(dialog); 
        dialog.showModal(); 
    });
}

function runBookmarklet(utmSource) 
{
    localStorage.clear();
    _WF.cache.setItem("logging", "*").asPersistent();
    document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + `?utm_source=${utmSource}&utm_campaign=qa&utm_content=qa&utm_medium=qa&csplit=header&spallcontent=true&postcontent_ab=true`;
}