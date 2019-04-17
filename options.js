// action buttons
var saveConfigButton = document.getElementById('save');

// textareas with configuration
var SAVED_URLS = 'SAVED_URLS';
var SAVED_DISPLAYTIME = 'SAVED_DISPLAYTIME';
var SAVED_AUTOLOAD = 'SAVED_AUTOLOAD';
var textarea_urls = document.getElementById('urls');
var textarea_displayTime = document.getElementById('displaytime');
var checkbox_autoload = document.getElementById('autoload');

// iteration
var configUrls = [];
var configDisplayTime = [];
var configAutoLoad = false;
var tabIteration = [];

// actions
saveConfigButton.addEventListener('click', saveConfig);

// html css classNames
var hiddenCssClassName = "hidden";

// debug
var debugMe = true;

// functions
function toConsole(s, o) {
    if(console && debugMe) {
        console.log('Tab Switcher Background-Script:', s, o)
    }
}
/**
 * Load configuration from storage
 */
function loadConfig() {
    try {
        chrome.storage.sync.get([SAVED_URLS, SAVED_DISPLAYTIME, SAVED_AUTOLOAD], function(result) {
            toConsole('load configuration SAVED_URLS && SAVED_DISPLAYTIME && SAVED_AUTOLOAD', result);
            textarea_urls.value = result[SAVED_URLS];
            textarea_displayTime.value = result[SAVED_DISPLAYTIME];
            checkbox_autoload.checked = result[SAVED_AUTOLOAD] ? 'checked' : '';
        });
    } catch(e) {
        toConsole('could not load configuration', e);
    }
}
/**
 * Save configuration from storage
 */
function saveConfig() {
    try {
        toConsole('save configurations', { "urls": textarea_urls.value, "displaytime": textarea_displayTime.value, "autoload": checkbox_autoload.checked });
        chrome.storage.sync.set({SAVED_URLS: textarea_urls.value, SAVED_DISPLAYTIME: textarea_displayTime.value, SAVED_AUTOLOAD: checkbox_autoload.checked }, function() {
            console.log('SAVED_URLS is set to ' + textarea_urls.value);
            console.log('SAVED_DISPLAYTIME is set to ' + textarea_displayTime.value);
        });
    } catch(e) {
        toConsole('could not save configuration', e);
    }
}

/**
 * Load
 */
loadConfig();