# Chrome Extension Tab Switcher

This extension should be easy to manage and reliable. It is developed for switching browser-tabs (for e.g. monitoring-graphs) by a configured display time.

## Author

Markus Brunner <https://github.com/markusbrunner-design/>

## Repository

https://github.com/markusbrunner-design/chrome_extension_tab_switcher.git

## Chrome Web Store

=> Chrome Extension Tab Switcher: https://chrome.google.com/webstore/detail/chrome-extension-tab-swit/ndjdbgjlaggipkekdpicpcldaocmigfl

## Usage

### Configuration

Go to options-page (see: examples/ts_options.png; options in context-menue of the extension-icon) and set your preferred values for tab-switcher:
* urls: comma-separated list of urls
* display-time: comma-separated list of tab-display-time in seconds
* reload-time (close tabs and reinitiate = valuable for applications which would crash the browser otherwise): integer/double value in hours => -1 = deactivated; 1 = each hour; 0.25 = each quarter hour; 24 = each day
* auto-load: if active the tabs will be automatically opened on browser-load (if opened via kiosk-mode you need to enable the extension can be run in private mode option in chrome extension settings)

### Activation

Just click on the extension-icon to activate the tab-switcher and click again for deactivation (see examples/ts_activated.png).

## Development based on

* Chrome API:
    * Tabs: https://developer.chrome.com/extensions/tabs
    * Storage: https://developer.chrome.com/extensions/storage
* How-To Chrome Extension: 
    * https://developer.chrome.com/extensions/manifest
    * https://medium.freecodecamp.org/how-to-create-a-chrome-extension-part-1-ad2a3a77541
    * https://medium.com/tech-tajawal/build-a-simple-google-chrome-extension-in-few-minutes-1f13b600e83e
    * https://stackoverflow.com/questions/43055526/chrome-extension-popup-not-showing-anymore
    * https://developer.chrome.com/extensions/background_pages
    * https://medium.com/@vanessajimenez_85032/chrome-extensions-content-scripts-vs-background-scripts-7bbd01f9dbe6

### Conclusions

* no content_scripts needed => no change of opened pages
* options_page needed for settings => save in chrome storage
* background_scripts needed for fullfilling the tab-switching logic
* browser_action => background task needed (not working together with popup action...)