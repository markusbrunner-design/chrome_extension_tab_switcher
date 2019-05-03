# Chrome Extension Tab Switcher

This extension should be easy to manage and reliable. It is developed for switching browser-tabs (for e.g. monitoring-graphs) by a configured display time.

## Author

Markus Brunner <https://github.com/markusbrunner-design/>

## Repository

https://github.com/markusbrunner-design/chrome_extension_tab_switcher.git

## Chrome Web Store

=> Chrome Extension Tab Switcher: https://chrome.google.com/webstore/detail/chrome-extension-tab-swit/ndjdbgjlaggipkekdpicpcldaocmigfl

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

## Usage

### Configuration

Go to options-page (see: examples/ts_options.png; options in context-menue of the extension-icon) and set your preferred values for tab-switcher:
* urls: return-separated list of urls
* display-time: return-separated list of tab-display-time in seconds
* reload-time (close tabs and reinitiate = valuable for applications which would crash the browser otherwise): integer/double value in hours => -1 = deactivated; 1 = each hour; 0.25 = each quarter hour; 24 = each day
* auto-load: if active the tabs will be automatically opened on browser-load (if opened via kiosk-mode you need to enable the extension can be run in private mode option in chrome extension settings)

### Activation

Just click on the extension-icon to activate the tab-switcher and click again for deactivation (see examples/ts_activated.png).

### Usage with applications needing auto-login

### Suggested usage

Use it on a linux-based plattform like raspbian for displaying graphs on a monitor.

#### Configure Tab-Switcher

Choose "Auto-Load" on the options-page

#### Cron-Job Auto-Update Auto-Reboot

Therefore you should add the following cron-job to auto-update and auto-restart:

    $ sudo su
    $ crontab -e
    
    # add this line to your crontab configuration to auto-update and auto-reboot
    0 5 * * 1 apt update && apt upgrade -y && reboot

#### Run Kiosk-Mode on reboot

Furthermore you need to auto-start the browser - in this case chrome / chromium - on reboot via kiosk-mode:

Chrome in Kiosk Mode without screensaver (https://itrig.de/index.php?/archives/2309-Raspberry-Pi-3-Kiosk-Chromium-Autostart-im-Vollbildmodus-einrichten.html)

    $ sudo nano /home/pi/.config/lxsession/LXDE-pi/autostart
    $ sudo nano /home/mydefaultnonadminuser/.config/lxsession/LXDE-pi/autostart

    # add the following lines to both configurations:
    @lxpanel --profile LXDE-pi
    @pcmanfm --desktop --profile LXDE-pi
    #@xscreensaver -no-splash
    @unclutter
    @xset s off
    @xset -dpms
    @xset s noblank
    @chromium-browser --kiosk chrome://extensions/

#### Add Tampermonkey Scripts for Auto-Login of applications, example for a zabbix-application

Therefore first install the "Tampermonkey" extension on Chrome Web Store: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

    // ==UserScript==
    // @name         Auto-Login Zabbix
    // @namespace    http://tampermonkey.net/
    // @version      1.0
    // @description  Tooluser Zabbix-Login
    // @author       You
    // @match        https://myzabbixinstance.com/*
    // @grant        none
    // ==/UserScript==

    (function() {
    'use strict';

        try {
            // login step 1
            if(document.getElementById('login')) {
                document.getElementById('login').click();
            }

            // login step 2
            if(document.getElementById('name')) {
                document.getElementById('name').value = 'myuser';
                document.getElementById('password').value = 'mypassword';
                document.getElementById('enter').click();
            }
        } catch(e) {
            if(console) { console.log(e); }
        }

    })();