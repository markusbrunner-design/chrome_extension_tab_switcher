# Chrome Extension Tab Switcher

This extension should be easy to manage and reliable. It is developed for switching browser-tabs (for e.g. monitoring-graphs) by a configured display time.

## Author

Markus Brunner <https://github.com/markusbrunner-design/>

## Repository

https://github.com/markusbrunner-design/chrome_extension_tab_switcher.git

## Development based on

* Chrome API:
    * Tabs: https://developer.chrome.com/extensions/tabs
    * Storage: https://developer.chrome.com/extensions/storage
* How-To Chrome Extension: 
    * https://medium.freecodecamp.org/how-to-create-a-chrome-extension-part-1-ad2a3a77541
    * https://medium.com/tech-tajawal/build-a-simple-google-chrome-extension-in-few-minutes-1f13b600e83e
    * https://stackoverflow.com/questions/43055526/chrome-extension-popup-not-showing-anymore
    * https://developer.chrome.com/extensions/background_pages
    * https://medium.com/@vanessajimenez_85032/chrome-extensions-content-scripts-vs-background-scripts-7bbd01f9dbe6

### conclusions

* no content_scripts needed
* options_page needed for settings
* browser_action => background task (not working together with popup...)
* background_scripts needed for fullfilling the tab-switching logic