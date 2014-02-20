# What is it ?

A tool to reload necessary part of the page, and leave js and css intact for faster loading and stuff like constantly playing player and so on. And responsive reloading behaviour by browser loading progress.

# How to use ?

Include iframe_reloader.js to your html.

A simpliest way to use is set to needed container needed attribute default is *data-pjax-container* and bind event *click* to needed links or watever you want by attribute *data-ifr-url* something like this:

```javascript
$('a').on 'click', IFrameReloader.click
```

And that's it.

# Configuration

```javascipt
IFrameReloader.configure({
    urlParam: '_ifr',
    dataUrlAttribute: 'data-ifr-url',
    replacementContainerAttribute: 'data-pjax-container',
    iframeId: 'util-iframe'
});
```

Params:

Name | Value
----- | ------
urlParam | Parameter name to add to request, for server to know that the request from reloader
dataUrlAttribute | Attribute to get url for request, or if it is link, url will get from href attribute
replacementContainerAttribute | Attribute to change content of successfully loaded page and current page
iframeId | id of created iframe if needed

