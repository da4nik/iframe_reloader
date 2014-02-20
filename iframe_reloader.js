(function (ifr) {
  'use strict';

  var opts = {
    urlParam: '_ifr',
    dataUrlAttribute: 'data-ifr-url',
    replacementContainerAttribute: 'data-pjax-container',
    iframeId: 'util-iframe',
    onload: null,
    onerror: null
  },
    support = {
      historyApi: !!(window.history && window.history.pushState)
    };

  function isFunction(func) {
    var getType = {};
    return func && getType.toString.call(func) === '[object Function]';
  }

  function extend(options, defaults) {
    var result = defaults || {}, key;
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        result[key] = options[key];
      }
    }
    return result;
  }

  function fireEvent(element, event) {
    var evt, result;
    if (document.createEventObject) {
      evt = document.createEventObject();
      result = element.fireEvent('on' + event, evt);
    } else {
      evt = document.createEvent("HTMLEvents");
      evt.initEvent(event, true, true);
      result = !element.dispatchEvent(evt);
    }
    return result;
  }

  function onloadHandler(event) {
    event.preventDefault();

    function removeIFRParameter(url) {
      if (url.indexOf('?') < 0) { return url; }
      var result = url.split('?')[0],
        params = url.split('?')[1].split('&'),
        index;

      for (index in params) {
        if (params.hasOwnProperty(index)) {
          if (params[index].indexOf(opts.urlParam) === 0) {
            params.splice(index, 1);
          }
        }
      }
      return result + (params.length > 0 ? '?' : '') + params.join('&');
    }

    var iframe = event.currentTarget,
      innerDoc = iframe.contentDocument || iframe.contentWindow.document,
      source = innerDoc.querySelector('[' + opts.replacementContainerAttribute + ']'),
      target = document.querySelector('[' + opts.replacementContainerAttribute + ']');

    history.pushState(null, document.title, removeIFRParameter(innerDoc.location.href));
    target.innerHTML = source.innerHTML;

    iframe.remove();
    if (isFunction(opts.onload)) { opts.onload(event); }
  }

  function onerrorHandler(event) {
    event.preventDefault();
    event.currentTarget.remove();
    if (isFunction(opts.onerror)) { opts.onerror(event); }
  }

  function requestPage(url) {
    var iframe = document.createElement('iframe');

    url =  url + (url.indexOf('?') > 0 ?  '&' : '?') + opts.urlParam + '=true';

    iframe.setAttribute('style', 'width: 0; height: 0; display: none');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.setAttribute('id', opts.iframeId);
    iframe.onload = onloadHandler;
    iframe.onerror = iframe.onabort = onerrorHandler;
    iframe.setAttribute('src', url);
    document.body.appendChild(iframe);
  }

  function popstateHandler(event) {
    requestPage(window.location.href);
  }

  ifr.configure = function (options) {
    opts = extend(options, opts);
  };

  ifr.click = function (event) {
    if (!support.historyApi) {
      return;
    }
    event.preventDefault();

    var element = event.currentTarget,
      url = element.hasOwnProperty(opts.dataUrlAttribute) ?
          element.getAttribute(opts.dataUrlAttribute) :
          element.getAttribute('href');

    if (url === 'undefined') { return; }

    requestPage(url);
  };

  ifr.go = function (url) {
    if (!support.historyApi) {
      return;
    }

    requestPage(url);
  };

  function init() {
    window.addEventListener('popstate', popstateHandler, false);
  }
  init();

}(window.IFrameReloader = window.IFrameReloader || {}));
