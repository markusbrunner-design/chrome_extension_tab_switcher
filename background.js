// Constants
var SAVED_URLS = 'SAVED_URLS';
var SAVED_DISPLAYTIME = 'SAVED_DISPLAYTIME';
var SAVED_AUTOLOAD = 'SAVED_AUTOLOAD';
var SAVED_RELOADTIME = 'SAVED_RELOADTIME';

// Storage
var savedUrls = '';
var savedDisplayTimes = '';

// iteration
var configUrls = [];
var configDisplayTime = [];
var configReloadTime = 0;
var configAutoLoad = false;
var tabIteration = [];
var tabTimeout = null;
var reloadTimeout = null;

// defaults
var defaultUrls = 'chrome://extensions/\nhttps://chrome.google.com/webstore/category/extensions';
var defaultDisplayTime = '3\n3';
var fallbackDisplayTime = 10;
var defaultReloadTime = 0;
var defaultAutoLoad = 0;
var defaultExtensionImage = 'images/img128.png';
var activeExtensionImage = 'images/img128_active.png';

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
function loadConfig(callback) {
    try {
        chrome.storage.sync.get([SAVED_URLS, SAVED_DISPLAYTIME, SAVED_RELOADTIME, SAVED_AUTOLOAD], function(result) {
            toConsole('load configuration SAVED_URLS && SAVED_DISPLAYTIME && SAVED_AUTOLOAD', result);

            savedUrls = result[SAVED_URLS] ? result[SAVED_URLS] : defaultUrls;
            configUrls = savedUrls.replace(/ /g, '').split(/\r|\n/);

            savedDisplayTimes = result[SAVED_DISPLAYTIME] ? result[SAVED_DISPLAYTIME] : defaultDisplayTime;
            configDisplayTime = savedDisplayTimes.replace(/ /g, '').split(/\r|\n/);

            configReloadTime = result[SAVED_RELOADTIME] ? result[SAVED_RELOADTIME] : defaultReloadTime;

            configAutoLoad = result[SAVED_AUTOLOAD] ? result[SAVED_AUTOLOAD] : defaultAutoLoad;

            if(configReloadTime > 0) {
                toConsole('start with reload-iteration', configReloadTime);
                callback();
                clearTimeout(reloadTimeout);
                reloadTimeout = setTimeout(reload, configReloadTime * 3600000);
            } else {
                toConsole('start without reload-iteration');
                callback();
            }
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
        toConsole('could not open tab', e);
    }
}
/**
 * Reloads the tabs via stop, start
 */
function reload() {
    toConsole('reload via stop, start');
    stop();
    start();
}
/**
 * Close all opened tabs
 */
function closeTabs() {
    tabIteration.forEach(function(tabId) {
        try {
            chrome.tabs.remove(tabId);
        } catch(e) {
            toConsole('Error in closeTabs: ', [tabId, e]);
            removeTabFromConfigArray(tabId);
        }
    });
}
/**
 * Return displaytime in milliseconds depending on configuration
 * @param {} key 
 */
function getDisplayTimeByKey(key) {
    var displayTime = fallbackDisplayTime * 1000;
    if(configDisplayTime[key]) {
        displayTime = configDisplayTime[key] * 1000;
    }
    toConsole('key, displayTime in ms: ', [key, displayTime])
    return displayTime;
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
        clearTimeout(tabTimeout);
        tabTimeout = setTimeout(showNext, getDisplayTimeByKey(currentSite));
    };
    showNext();
}
/**
 * Activate another tab
 * @param {*} tabId 
 */
function activateTab(tabId) {
    try {
        chrome.tabs.update(tabId, { 'active': true }, (tab) => { });
    } catch(e) {
        toConsole('Error for activateTab:', [tabId, e]);
        removeTabFromConfigArray(tabId);
    }
}
/**
 * Remove tab from tabIteration-array
 * @param {*} tabId 
 */
function removeTabFromConfigArray(tabId) {
    toConsole('remove tab with Id: ', tabId);
    var indexOfTabId = tabIteration.indexOf(tabId);
    if(indexOfTabId >= 0) {
        tabIteration.splice(indexOfTabId, 1);
    }
}
/**
 * Start iteration of tabs => initialize iteration
 */
function start() {
    toConsole('start');
    try {
        chrome.browserAction.setTitle({'title': 'Deactivate Tab Switcher'});
        chrome.browserAction.setIcon({'path': activeExtensionImage});
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
        chrome.browserAction.setIcon({'path': defaultExtensionImage});
        closeTabs();
        tabIteration = [];
        clearTimeout(tabTimeout);
        clearTimeout(reloadTimeout);
    } catch(e) {
        toConsole('error in stopping', e);
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
 * Add Listener for Tab-Remove
 */
chrome.tabs.onRemoved.addListener(function(tabId) {
    removeTabFromConfigArray(tabId);
});
/**
 * Start automatically if option was set for auto-load
 */
chrome.windows.onCreated.addListener(function() {
    try {
        start();
    } catch(e) {
        stop();
    }
});
/**
 * Stop automatically on window-close
 */
chrome.windows.onRemoved.addListener(function() {
    stop();
});