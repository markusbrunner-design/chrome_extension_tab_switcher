// Constants
var SAVED_URLS = 'SAVED_URLS';
var SAVED_DISPLAYTIME = 'SAVED_DISPLAYTIME';
var SAVED_AUTOLOAD = 'SAVED_AUTOLOAD';

// Storage
var savedUrls = '';
var savedDisplayTimes = '';

// iteration
var configUrls = [];
var configDisplayTime = [];
var configAutoLoad = false;
var tabIteration = [];

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
function loadConfig(callback) {
    try {
        chrome.storage.sync.get([SAVED_URLS, SAVED_DISPLAYTIME, SAVED_AUTOLOAD], function(result) {
            toConsole('load configuration SAVED_URLS && SAVED_DISPLAYTIME && SAVED_AUTOLOAD', result);

            savedUrls = result[SAVED_URLS];
            configUrls = savedUrls.replace(' ', '').split(',');

            savedDisplayTimes = result[SAVED_DISPLAYTIME];
            configDisplayTime = savedDisplayTimes.replace(' ', '').split(',');

            configAutoLoad = result[SAVED_AUTOLOAD];

            callback();
        });
    } catch(e) {
        toConsole('could not load configuration', e);
    }
}
/**
 * Add tabs to iteration array "tabIteration"
 */
function openTabs() {
    try {
        configUrls.forEach(function(configUrl, key) {
            chrome.tabs.create({ url: configUrl }, function(tab) {
                tabIteration.push(tab.id);
                toConsole('push tab to iteration array', [tabIteration, tab, configUrls.length, key]);

                // if last element... start iteration
                if(configUrls.length == key+1) {
                    iterateOpenedTabs();
                }
            });   
        });
    } catch(e) {
        toConsole("could not open tab", e);
    }
}
/**
 * Close all opened tabs
 */
function closeTabs() {
    try {
        tabIteration.forEach(function(tabId) {
            chrome.tabs.remove(tabId);
        });
    } catch(e) {
        toConsole("could not close tabs", e);
    }
}
/**
 * Return displaytime in milliseconds depending on configuration
 * @param {} key 
 */
function getDisplayTimeByKey(key) {
    try {
        return configDisplayTime[key] * 1000;
    } catch(e) {
        return 30 * 1000;
    }
}
/**
 * Iterate "tabIteration"
 */
function iterateOpenedTabs() {
    var currentSite = 0;
    var showNext = function() {
        toConsole('showNext', [currentSite, tabIteration]);
        if(tabIteration.length < 1) {
            toConsole('tabIteration array is empty => nothing to show here...', tabIteration);
            return false;
        }
        currentSite++;
        if(currentSite >= tabIteration.length) {
            currentSite = 0;
        }
        activateTab(tabIteration[currentSite]);
        setTimeout(showNext, getDisplayTimeByKey(currentSite));
    };
    showNext();
}
/**
 * Activate another tab
 * @param {*} tabId 
 */
function activateTab(tabId) {
    chrome.tabs.update(tabId, { 'active': true }, (tab) => { });
}
/**
 * Start iteration of tabs => initialize iteration
 */
function start() {
    toConsole('start');
    try {
        chrome.browserAction.setTitle({'title': 'Deactivate Tab Switcher'});
        loadConfig(openTabs);
    } catch(e) {
        stop();
    }
}
/**
 * Stop iteration of tabs => empty "tabIteration" array
 */
function stop() {
    toConsole('stop');
    try {
        chrome.browserAction.setTitle({'title': 'Activate Tab Switcher'});
        closeTabs();
        tabIteration = [];
    } catch(e) {
    }
}
/**
 * Start and Stop it on brower_action Icon click
 */
chrome.browserAction.onClicked.addListener(function(){
    if(tabIteration.length < 1) {
        start(); 
    } else {
        stop();
    }
});
/**
 * Start automatically if option was set for auto-load
 */
loadConfig(function(){
    if(configAutoLoad) {
        openTabs();
    }
});