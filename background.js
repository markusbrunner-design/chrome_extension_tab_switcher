// Constants
var SAVED_URLS = 'SAVED_URLS';
var SAVED_DISPLAYTIME = 'SAVED_DISPLAYTIME';
var SAVED_AUTOTABRELOAD = 'SAVED_AUTOTABRELOAD';
var SAVED_AUTOLOAD = 'SAVED_AUTOLOAD';
var SAVED_RELOADTIME = 'SAVED_RELOADTIME';

// Storage
var savedUrls = '';
var savedDisplayTimes = '';

// iteration
var configUrls = [];
var configDisplayTime = [];
var configReloadTime = 0;
var configAutoTabReload = false;
var configAutoLoad = false;
var tabIteration = [];
var tabTimeout = null;
var reloadTimeout = null;

// defaults
var defaultUrls = 'chrome://extensions/\nhttps://chrome.google.com/webstore/category/extensions';
var defaultDisplayTime = '10\n10';
var fallbackDisplayTime = 10;
var defaultReloadTime = 0;
var defaultAutoLoad = 0;
var defaultAutoTabReload = 0;
var defaultExtensionImage = 'images/img128.png';
var activeExtensionImage = 'images/img128_active.png';
var defaultWindowId = chrome.windows.WINDOW_ID_CURRENT;

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
        chrome.storage.sync.get([SAVED_URLS, SAVED_DISPLAYTIME, SAVED_RELOADTIME, SAVED_AUTOTABRELOAD, SAVED_AUTOLOAD], function(result) {
            toConsole('load configuration SAVED_URLS && SAVED_DISPLAYTIME && SAVED_AUTOTABRELOAD && SAVED_AUTOLOAD', result);

            savedUrls = result[SAVED_URLS] ? result[SAVED_URLS] : defaultUrls;
            configUrls = savedUrls.replace(/ /g, '').split(/\r|\n/);

            savedDisplayTimes = result[SAVED_DISPLAYTIME] ? result[SAVED_DISPLAYTIME] : defaultDisplayTime;
            configDisplayTime = savedDisplayTimes.replace(/ /g, '').split(/\r|\n/);

            configReloadTime = result[SAVED_RELOADTIME] ? result[SAVED_RELOADTIME] : defaultReloadTime;

            configAutoTabReload = result[SAVED_AUTOTABRELOAD] ? result[SAVED_AUTOTABRELOAD] : defaultAutoTabReload;

            configAutoLoad = result[SAVED_AUTOLOAD] ? result[SAVED_AUTOLOAD] : defaultAutoLoad;

            if(configReloadTime > 0) {
                toConsole('start with reload-iteration', configReloadTime);
                if(callback) {
                    callback();
                }
                clearTimeout(reloadTimeout);
                reloadTimeout = setTimeout(reload, configReloadTime * 3600000);
            } else {
                toConsole('start without reload-iteration');
                if(callback) {
                    callback();
                }
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
            chrome.tabs.create({ "windowId": defaultWindowId, "url": configUrl }, function(tab) {
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
    try {
        if(configDisplayTime[key]) {
            displayTime = configDisplayTime[key] * 1000;
        }
        if(displayTime < 0) {
            displayTime = fallbackDisplayTime * 1000;
        }   
    } catch(e) {
        toConsole('getDisplayTimeByKey error:', e);
    }
    toConsole('key, displayTime in ms: ', [key, displayTime]);
    return displayTime;
}
/**
 * Iterate "tabIteration"
 */
function iterateOpenedTabs() {
    var activeSite = 0,
        tmpOldSite = 0;
    var showNext = function() {
        toConsole('showNext', [activeSite, tabIteration]);
        if(tabIteration.length < 1) {
            toConsole('tabIteration array is empty => nothing to show here...', tabIteration);
            return false;
        }
        tmpOldSite = activeSite;
        activeSite++;
        if(activeSite >= tabIteration.length) {
            activeSite = 0;
        }
        activateTab(tabIteration[activeSite], activeSite);
        if(configAutoTabReload) {
            reloadTab(tabIteration[tmpOldSite]);
        }
        clearTimeout(tabTimeout);
        tabTimeout = setTimeout(showNext, getDisplayTimeByKey(activeSite));
    };
    showNext();
}
/**
 * Reload a tab
 * @param {*} tabId 
 */
function reloadTab(tabId, callback) {
    try{
        chrome.tabs.reload(tabId, function() {
            if(callback) {
                callback();
            }
        });
    } catch(e) {
        toConsole('Error for reloadTab:', [tabId, e]);
    }
}
/**
 * Activate another tab
 * @param {*} tabId 
 */
function activateTab(tabId, currentSite) {
    try {
        chrome.tabs.update(tabId, { "active": true }, (tab) => { });
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
    try {
        var indexOfTabId = tabIteration.indexOf(tabId);
        if(indexOfTabId >= 0) {
            tabIteration.splice(indexOfTabId, 1);
        }
    } catch(e) {
        toConsole('removeTabFromConfigArray error:', e);
    }
}
/**
 * Start iteration of tabs => initialize iteration
 */
function start() {
    toConsole('start');
    try {
        chrome.browserAction.setTitle({"title": 'Deactivate Tab Switcher'});
        chrome.browserAction.setIcon({"path": activeExtensionImage});
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
        chrome.browserAction.setTitle({"title": 'Activate Tab Switcher'});
        chrome.browserAction.setIcon({"path": defaultExtensionImage});
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
 * Stop automatically on window-close
 */
chrome.windows.onRemoved.addListener(function() {
    stop();
});
/**
 * Start automatically if option was set for auto-load
 */
chrome.windows.onCreated.addListener(function (window) {
    chrome.tabs.query({"windowId" : window.id}, function() {
        chrome.windows.update(window.id, { "focused": true }, function(window) {
            toConsole('chrome.windows.onCreated', window);
            loadConfig(function(){
                toConsole('loadConfig initial', [configUrls, configDisplayTime, configReloadTime, configAutoLoad]);
                if(configAutoLoad) {
                    start();
                }
            });
        });
	});
});