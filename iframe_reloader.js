(function (window, document, undefined) {
  "use strict";

  if (window.IFrameReloader) { return; }

  var settings = {
    urlParam: '_ifr',
    dataUrlAttribute: 'data-ifr-url',
    replacementContainerAttribute: 'data-pjax-container',
    iframeId: 'util-iframe',
    popstateEventBound: false
  };

  function addEventHandler(elem, eventType, handler) {
    if (elem.addEventListener)
      elem.addEventListener (eventType,handler,false);
    else if (elem.attachEvent)
      elem.attachEvent ('on'+eventType,handler);
  }

  function fireEvent(element, event){
    if (document.createEventObject){
      var evt = document.createEventObject();
      return element.fireEvent('on'+event, evt)
    }
    else{
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent(event, true, true );
      return !element.dispatchEvent(evt);
    }
  }

  var IFrameReloader = function(settings) {
    settings = settings || {};
    this.urlParam = settings.url_param || '_ifr';
    this.dataUrlAttribute = settings.data_url_param || 'data-irf-url';
  }

  IFrameReloader.prototype = {
    init: function () {
    }
  }

  IFrameReloader.popstateHandler = function(event) {
    if (event.state.ifr) {
      IFrameReloader.requestPage(window.location.href);
    }
  }

  IFrameReloader.onloadHandler = function(event) {
    event.preventDefault();

    function removeIFRParameter(url) {
      if (url.indexOf('?') < 0) { return url; }
      var result = url.split('?')[0],
          params = url.split('?')[1].split('&');

      for (var index in params) {
        if (params[index].indexOf(settings.urlParam) == 0) {
          params.splice(index, 1);
        }
      }
      return result + (params.length > 0 ? '?' : '') + params.join('&');
    }

    var iframe = event.currentTarget,
        innerDoc = iframe.contentDocument || iframe.contentWindow.document,
        source = innerDoc.querySelector('[' + settings.replacementContainerAttribute + ']'),
        target = document.querySelector('[' + settings.replacementContainerAttribute + ']');

    history.pushState({ifr: true}, document.title, removeIFRParameter(innerDoc.location.href));
    target.innerHTML = source.innerHTML;

    if (!settings.popstateEventBound) {
      addEventHandler(window, 'popstate', IFrameReloader.popstateHandler);
      settings.popstateEventBound = true;
    }

    // прикинемся pjaxом
    fireEvent(document, 'pjax:end');

    iframe.remove();
  }

  IFrameReloader.onerrorHandler = function(event) {
    event.preventDefault();
    event.currentTarget.remove();
  }

  IFrameReloader.requestPage = function(url) {
    var iframe = document.createElement('iframe');
        url =  url + (url.indexOf('?') > 0 ?  '&' : '?') + settings.urlParam +'=true';

    iframe.setAttribute('style', 'width: 0; height: 0; display: none');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.setAttribute('id', settings.iframeId);
    iframe.onload = IFrameReloader.onloadHandler;
    iframe.onerror = iframe.onabort = IFrameReloader.onerrorHandler;
    iframe.setAttribute('src', url);
    document.body.appendChild(iframe);
  }

  IFrameReloader.click = function(event) {
    // Fallback if history api not supported
    if (!(window.history && window.history.pushState)) {
      return;
    }
    event.preventDefault();

    var element = event.currentTarget,
        url = element.hasOwnProperty(settings.dataUrlAttribute) ?
                element.getAttribute(settings.dataUrlAttribute) :
                element.getAttribute('href');

    if (typeof url === 'undefined') { return; }

    IFrameReloader.requestPage(url);
  }


  window.IFrameReloader = IFrameReloader;
})(window, document);