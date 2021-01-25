window.onload = function() {
    const useNodeJS = true;   // if you are not using a node server, set this value to false
    const defaultLiffId = "";   // change the default LIFF value if you are not using a node server

    // DO NOT CHANGE THIS
    let myLiffId = "";

    const urlString = window.location.href;
    const url = new URL(decodeURIComponent(urlString));
    const uuid = url.searchParams.get("UUID");

    if (uuid != null) {
        setValue('UUID', uuid);
    }

    // if node is used, fetch the environment variable and pass it to the LIFF method
    // otherwise, pass defaultLiffId
    if (useNodeJS) {
        fetch('/send-id')
            .then(function(reqResponse) {
                return reqResponse.json();
            })
            .then(function(jsonResponse) {
                myLiffId = jsonResponse.id;
                initializeLiffOrDie(myLiffId);
            })
            .catch(function(error) {
                document.getElementById("liffAppContent").classList.add('hidden');
                document.getElementById("nodeLiffIdErrorMessage").classList.remove('hidden');
            });
    } else {
        myLiffId = defaultLiffId;
        initializeLiffOrDie(myLiffId);
    }
};

/**
* Check if myLiffId is null. If null do not initiate liff.
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiffOrDie(myLiffId) {
    if (!myLiffId) {
        document.getElementById("liffAppContent").classList.add('hidden');
        document.getElementById("liffIdErrorMessage").classList.remove('hidden');
    } else {
        initializeLiff(myLiffId);
    }
}

/**
* Initialize LIFF
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiff(myLiffId) {
    liff
        .init({
            liffId: myLiffId
        })
        .then(() => {
            // start to use LIFF's api
            initializeApp();
        })
        .catch((err) => {
            document.getElementById("liffAppContent").classList.add('hidden');
            document.getElementById("liffInitErrorMessage").classList.remove('hidden');
        });
}

/**
 * Initialize the app by calling functions handling individual app components
 */
function initializeApp() {
    displayIsInClientInfo();
    registerButtonHandlers();

    // check if the user is logged in/out, and disable inappropriate button
    if (liff.isLoggedIn()) {
        $.blockUI({ message: "<h3>Please wait...</h3>" });
        document.getElementById('liffLoginButton').disabled = true;
        liff.getProfile().then(function(profile) {
              setValue('USER_ID', profile.userId);

              const idToken = liff.getIDToken();
              setValue('ID_TOKEN',idToken);

              updateMappingTable();
        }).catch(function(error) {

        });
    } else {
        document.getElementById('liffLogoutButton').disabled = true;
    }
}

function updateMappingTable() {
    const xhr = new XMLHttpRequest();
   
    // listen for `load` event
//    xhr.onreadystatechange = () => {
//        if (xhr.readyState >= 2) {
//            window.location.href = "https://line.me/R/ti/p/@335mqiis";
//            liff.logout();
//            $.unblockUI();
//        }
//    };

    xhr.onreadystatechange = () => {
            // print JSON response
        if (xhr.status >= 200) {
                window.location.href = "https://line.me/R/ti/p/@335mqiis";
                liff.logout();
                $.unblockUI();
                if (xhr.status == 200) {

                } else if (xhr.status == 409) {

                } else if (xhr.status == 404) {

                }
            }
    };

    // create a JSON object
    const json = { uuid: getValue('UUID'), userToken: getValue('ID_TOKEN'),
                lineUserId: getValue('USER_ID')};
    // open request
    xhr.open('PUT', 'https://cors-anywhere.herokuapp.com/https://line-project-poc.herokuapp.com/updateMappingTable');
    // set `Content-Type` header
    xhr.setRequestHeader('Content-Type', 'application/json');
    // send rquest with JSON payload
    xhr.send(JSON.stringify(json));
}

function xhrProgress(oEvent) {
  if (oEvent.lengthComputable) {
        window.location.href = "https://line.me/R/ti/p/@335mqiis";
        liff.logout();
        $.unblockUI();
  } else {
    // Unable to compute progress information since the total size is unknown
  }
}

/**
* Toggle the login/logout buttons based on the isInClient status, and display a message accordingly
*/
function displayIsInClientInfo() {
    if (liff.isInClient()) {
        document.getElementById('liffLoginButton').classList.toggle('hidden');
        document.getElementById('liffLogoutButton').classList.toggle('hidden');
    }
}

/**
* Register event handlers for the buttons displayed in the app
*/
function registerButtonHandlers() {
    // login call, only when external browser is used
    document.getElementById('liffLoginButton').addEventListener('click', function() {
        if (!liff.isLoggedIn()) {
            let url = "https://lineprojectliff.herokuapp.com/index.html?UUID=" + getCookie("UUID");
            // set `redirectUri` to redirect the user to a URL other than the front page of your LIFF app.
            liff.login();
        }
    });

    // logout call only when external browse
    document.getElementById('liffLogoutButton').addEventListener('click', function() {
        if (liff.isLoggedIn()) {
            liff.logout();
            window.location.reload();
        }
    });
}

/**
* Alert the user if LIFF is opened in an external browser and unavailable buttons are tapped
*/
function sendAlertIfNotInClient() {
    alert('This button is unavailable as LIFF is currently being opened in an external browser.');
}

/**
* Toggle specified element
* @param {string} elementId The ID of the selected element
*/
function toggleElement(elementId) {
    const elem = document.getElementById(elementId);
    if (elem.offsetWidth > 0 && elem.offsetHeight > 0) {
        elem.style.display = 'none';
    } else {
        elem.style.display = 'block';
    }
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setValue(key, value) {
    localStorage.setItem(key, value);
    document.cookie = key + "=" + value + ";";
}

function getValue(key) {
    return localStorage.getItem(key);
    //getCookie(key);
}