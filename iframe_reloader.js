(function (ifr) {
  'use strict';

//  =========================== Variables

  var opts = {
    urlParam: '_ifr',
    dataUrlAttribute: 'data-ifr-url',
    dataLabelAttribute: 'data-ifr-label',
    replacementContainerAttribute: 'data-ifr-container',
    iframeId: 'util-iframe',
    onload: null,
    onerror: null,
    onclick: null,
    useProgressBar: true,
    progressBarId: 'ifr-progress',
    progressInnerBarClass: 'indicator',
    progressAppendTo: 'body',
    progressRemoveTimeout: 200,
    progressHideOnMaxValueSet: true
  },
    support = {
      historyApi: !!(window.history && window.history.pushState)
    },
    progressBar, innerBar, fakeWorkTimer, currentProgress = 0;

//  =========================== Utils

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

  function bindTransitionendEvent(elem, callback) {
    var event_names = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd'], i;
    for (i = 0; i < event_names.length; i++) {
      elem.addEventListener(event_names[i], callback, false);
    }
  }

  function toLimits(value, min, max) {
    if (value > max) { return max; }
    if (value < min) { return min; }
    return value;
  }

//  =========================== Private methods

  function progressStopFakeWork() {
    clearTimeout(fakeWorkTimer);
  }

  function insertProgress(progress) {
    if (progressBar) { return; }

    progress = progress || 0;
    progress = toLimits(progress);


    progressBar = document.createElement('div');
    progressBar.id = opts.progressBarId;
    document.querySelector(opts.progressAppendTo).appendChild(progressBar);

    innerBar = document.createElement('div');
    innerBar.className = opts.progressInnerBarClass;
    innerBar.style.width = (progress * 100) + '%';
    innerBar.style.height = '100%';
    progressBar.appendChild(innerBar);
    currentProgress = progress;
  }

  function removeProgress() {
    if (progressBar) {
      progressBar.remove();
      progressBar = innerBar = null;
      currentProgress = 0;
    }
  }

  function hideProgress() {
    if (progressBar) {
      progressStopFakeWork();
      innerBar.style.width = '100%';
      bindTransitionendEvent(innerBar, removeProgress);
      setTimeout(removeProgress, opts.progressRemoveTimeout);
      innerBar.style.display = 'hidden';

    }
  }

  function setProgress(progress) {
    progress = toLimits(progress);
    if (progressBar) {
      innerBar.style.width = progress * 100 + '%';
      currentProgress = progress;

      if (opts.progressHideOnMaxValueSet && progress >= 1) {
        hideProgress();
      }
    } else {
      insertProgress(progress);
    }
  }

  function progressStartFakeWork() {
    var work = function () {
      setProgress(currentProgress + Math.random() * 0.05);
      fakeWorkTimer = setTimeout(work, 300);
    };
    work();
  }


  function onerrorHandler(event) {
    event.preventDefault();
    event.currentTarget.remove();
    if (isFunction(opts.onerror)) { opts.onerror(event); }
    hideProgress();
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
      iframeLabel = iframe.getAttribute(opts.dataLabelAttribute),
      innerDoc = iframe.contentDocument || iframe.contentWindow.document,
      selector = '[' + opts.replacementContainerAttribute + '=""]',
      source,
      target;

    if (iframeLabel) {
      selector = ['[', opts.replacementContainerAttribute, '="', iframeLabel, '"]'].join('');
    }
    source = innerDoc.querySelector(selector);
    target = document.querySelector(selector);

    if (source ===  null) {
      onerrorHandler(event);
      return;
    }

    history.pushState(null, document.title, removeIFRParameter(innerDoc.location.href));
    target.innerHTML = source.innerHTML;
    document.title = innerDoc.title;

    iframe.remove();
    if (isFunction(opts.onload)) { opts.onload(event); }
    hideProgress();
  }

  function requestPage(url, label) {
    var iframe = document.createElement('iframe');

    url =  url + (url.indexOf('?') > 0 ?  '&' : '?') + opts.urlParam + '=true';

    iframe.setAttribute('style', 'width: 0; height: 0; display: none');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.setAttribute('id', opts.iframeId);
    if (label) {
      iframe.setAttribute(opts.dataLabelAttribute, label);
    }
    iframe.onload = onloadHandler;
    iframe.onerror = iframe.onabort = onerrorHandler;
    iframe.setAttribute('src', url);
    document.body.appendChild(iframe);
  }

  function popstateHandler(event) {
    requestPage(window.location.href);
  }


//  =========================== Public methods

  ifr.configure = function (options) {
    opts = extend(options, opts);
  };

  ifr.click = function (event) {
    if (!support.historyApi) {
      return;
    }
    event.preventDefault();

    if (opts.useProgressBar) {
      setProgress(0);
      progressStartFakeWork();
    }

    var element = event.currentTarget,
      url = element.hasOwnProperty(opts.dataUrlAttribute) ?
          element.getAttribute(opts.dataUrlAttribute) :
          element.getAttribute('href'),
      label;

    if (isFunction(opts.onclick)) { opts.onclick.call(element); }

    if (url === 'undefined') { return; }
    if (element.hasAttribute(opts.dataLabelAttribute)) {
      label = element.getAttribute(opts.dataLabelAttribute);
    }

    requestPage(url, label);
  };

  ifr.go = function (url, label) {
    if (!support.historyApi) {
      return;
    }

    requestPage(url, label);
  };

  ifr.setProgress = setProgress;
  ifr.showProgress = insertProgress;
  ifr.hideProgress = hideProgress;

//  =========================== Initialization

  function init() {
    window.addEventListener('popstate', popstateHandler, false);
  }
  init();

}(window.IFrameReloader = window.IFrameReloader || {}));
