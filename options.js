// action buttons
var saveConfigButton = document.getElementById('save');

// textareas with configuration
var SAVED_URLS = 'SAVED_URLS';
var SAVED_DISPLAYTIME = 'SAVED_DISPLAYTIME';
var SAVED_AUTOLOAD = 'SAVED_AUTOLOAD';
var SAVED_RELOADTIME = 'SAVED_RELOADTIME';
var textarea_urls = document.getElementById('urls');
var textarea_displayTime = document.getElementById('displaytime');
var input_reloadtime = document.getElementById('reloadtime');
var checkbox_autoload = document.getElementById('autoload');

// actions
saveConfigButton.addEventListener('click', saveConfig);

// html css classNames
var hiddenCssClassName = "hidden";

// defaults
var defaultUrls = 'chrome://extensions/,https://chrome.google.com/webstore/category/extensions';
var defaultDisplayTime = '3,3';
var defaultReloadTime = 0;
var defaultAutoLoadChecked = '';

// debug
var debugMe = false;

// functions
function toConsole(s, o) {
    if(console && debugMe) {
        console.log('Tab Switcher Background-Script:', s, o);
    }
}
/**
 * Load configuration from storage
 */
function loadConfig() {
    try {
        chrome.storage.sync.get([SAVED_URLS, SAVED_DISPLAYTIME, SAVED_RELOADTIME, SAVED_AUTOLOAD], function(result) {
            toConsole('load configuration SAVED_URLS && SAVED_DISPLAYTIME && SAVED_RELOADTIME && SAVED_AUTOLOAD', result);
            textarea_urls.value = result[SAVED_URLS] ? result[SAVED_URLS] : defaultUrls;
            textarea_displayTime.value = result[SAVED_DISPLAYTIME] ? result[SAVED_DISPLAYTIME] : defaultDisplayTime;
            input_reloadtime.value = result[SAVED_RELOADTIME] ? result[SAVED_RELOADTIME] : defaultReloadTime;
            checkbox_autoload.checked = result[SAVED_AUTOLOAD] ? 'checked' : defaultAutoLoadChecked;
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
        toConsole('save configurations', { "urls": textarea_urls.value, "displaytime": textarea_displayTime.value, "reloadtime": input_reloadtime.value, "autoload": checkbox_autoload.checked });
        chrome.storage.sync.set({SAVED_URLS: textarea_urls.value, SAVED_DISPLAYTIME: textarea_displayTime.value, SAVED_RELOADTIME: input_reloadtime.value, SAVED_AUTOLOAD: checkbox_autoload.checked }, function() {
            toConsole('SAVED_URLS is set to ' + textarea_urls.value);
            toConsole('SAVED_DISPLAYTIME is set to ' + textarea_displayTime.value);
            toConsole('SAVED_RELOADTIME is set to ' + input_reloadtime.value);
            toConsole('SAVED_AUTOLOAD is set to ' + checkbox_autoload.checked);
        });
    } catch(e) {
        toConsole('could not save configuration', e);
    }
}

/**
 * Load
 */
loadConfig();