# What is it ?

A tool to reload necessary part of the page, and leave js and css intact for faster loading and stuff like constantly playing player and so on. And responsive reloading behaviour by browser loading progress.

# How to use ?

Include iframe_reloader.js to your html.

A simpliest way to use is set to needed container needed attribute default is *data-pjax-container* and bind event *click* to needed links or watever you want by attribute *data-ifr-url* something like this:

```javascript
$('a').on 'click', IFrameReloader.click
```

And that's it.


# Progress bar

This can be used with custom progressbar, cause mobile browsers not showing it's progress. It can be used automatically with *useProgressBar* option is set. Or can be used as it's own.

Usage:
```javascript
// shows progress bar with progress 0 is does nothing if progress exists
IFrameReloader.showProgress();

// showing progress bar if not, and sets progress to *value*, value is between 0 and 1.
IFrameReloader.setProgress(value);

// hides progress with effect of 100% done
IFrameReloader.hideProgress();
```
Configuration for this a little bit lower.

# Configuration

```javascipt
IFrameReloader.configure({
    urlParam: '_ifr',
    dataUrlAttribute: 'data-ifr-url',
    replacementContainerAttribute: 'data-pjax-container',
    iframeId: 'util-iframe',
    onload: function() { console.log('success'); },
    onerror: function() { console.log('error or abort'); }
    useProgressBar: true,
    progressBarId: 'ifr-progress',
    progressInnerBarClass: 'indicator',
    progressAppendTo: 'body',
    progressRemoveTimeout: 200,
    progressHideOnMaxValueSet: true
});
```

Params:

Name | Value
----- | ------
urlParam | Parameter name to add to request, for server to know that the request from reloader
dataUrlAttribute | Attribute to get url for request, or if it is link, url will get from href attribute
replacementContainerAttribute | Attribute to change content of successfully loaded page and current page
iframeId | id of created iframe if needed
onload | Callback on successfully loaded page
onerror | Callback on error or abort loading page
useProgressBar| Set true to use custom progressbar, useful on mobile devices, which not showing browser progress
progressBarId| id of created progressbar div
progressInnerBarClass| Class is created progressbar indicator inside progressbar div, for styling purposes
progressAppendTo| Query string of element is append to
progressRemoveTimeout| Timeout of progressbar removal when it's done for animation purposes
progressHideOnMaxValueSet| true is for automatically hide when max value set.

