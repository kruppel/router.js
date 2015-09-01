export var slice = Array.prototype.slice;

var _isArray;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === "[object Array]";
  };
} else {
  _isArray = Array.isArray;
}

export var isArray = _isArray;

export function merge(hash, other) {
  for (var prop in other) {
    if (other.hasOwnProperty(prop)) { hash[prop] = other[prop]; }
  }
}

export var oCreate = Object.create || function(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
};

/**
  @private

  Extracts query params from the end of an array
**/
export function extractQueryParams(array) {
  var len = (array && array.length), head, queryParams;

  if(len && len > 0 && array[len - 1] && array[len - 1].hasOwnProperty('queryParams')) {
    queryParams = array[len - 1].queryParams;
    head = slice.call(array, 0, len - 1);
    return [head, queryParams];
  } else {
    return [array, null];
  }
}

/**
  @private

  Coerces query param properties and array elements into strings.
**/
export function coerceQueryParamsToString(queryParams) {
  for (var key in queryParams) {
    if (typeof queryParams[key] === 'number') {
      queryParams[key] = '' + queryParams[key];
    } else if (isArray(queryParams[key])) {
      for (var i = 0, l = queryParams[key].length; i < l; i++) {
        queryParams[key][i] = '' + queryParams[key][i];
      }
    }
  }
}
/**
  @private
 */
export function log(router, sequence, msg) {
  if (!router.log) { return; }

  if (arguments.length === 3) {
    router.log("Transition #" + sequence + ": " + msg);
  } else {
    msg = sequence;
    router.log(msg);
  }
}

export function bind(context, fn) {
  var boundArgs = arguments;
  return function(value) {
    var args = slice.call(boundArgs, 2);
    args.push(value);
    return fn.apply(context, args);
  };
}

export function isParam(object) {
  return (typeof object === "string" || object instanceof String || typeof object === "number" || object instanceof Number);
}


export function forEach(array, callback) {
  for (var i=0, l=array.length; i<l && false !== callback(array[i]); i++) { }
}

export function trigger(router, handlerInfos, ignoreFailure, args) {
  if (router.triggerEvent) {
    router.triggerEvent(handlerInfos, ignoreFailure, args);
    return;
  }

  var name = args.shift();

  if (!handlerInfos) {
    if (ignoreFailure) { return; }
    throw new Error("Could not trigger event '" + name + "'. There are no active handlers");
  }

  var eventWasHandled = false;

  for (var i=handlerInfos.length-1; i>=0; i--) {
    var handlerInfo = handlerInfos[i],
        handler = handlerInfo.handler;

    if (handler.events && handler.events[name]) {
      if (handler.events[name].apply(handler, args) === true) {
        eventWasHandled = true;
      } else {
        return;
      }
    }
  }

  if (!eventWasHandled && !ignoreFailure) {
    throw new Error("Nothing handled the event '" + name + "'.");
  }
}

export function getChangelist(oldObject, newObject) {
  var key;
  var results = {
    all: {},
    changed: {},
    removed: {}
  };

  merge(results.all, newObject);

  var didChange = false;
  coerceQueryParamsToString(oldObject);
  coerceQueryParamsToString(newObject);

  // Calculate removals
  for (key in oldObject) {
    if (oldObject.hasOwnProperty(key)) {
      if (!newObject.hasOwnProperty(key)) {
        didChange = true;
        results.removed[key] = oldObject[key];
      }
    }
  }

  // Calculate changes
  for (key in newObject) {
    if (newObject.hasOwnProperty(key)) {
      if (isArray(oldObject[key]) && isArray(newObject[key])) {
        if (oldObject[key].length !== newObject[key].length) {
          results.changed[key] = newObject[key];
          didChange = true;
        } else {
          for (var i = 0, l = oldObject[key].length; i < l; i++) {
            if (oldObject[key][i] !== newObject[key][i]) {
              results.changed[key] = newObject[key];
              didChange = true;
            }
          }
        }
      }
      else {
        if (oldObject[key] !== newObject[key]) {
          results.changed[key] = newObject[key];
          didChange = true;
        }
      }
    }
  }

  return didChange && results;
}

export function promiseLabel(label) {
  return 'Router: ' + label;
}

export function subclass(parentConstructor, proto) {
  function C(props) {
    parentConstructor.call(this, props || {});
  }
  C.prototype = oCreate(parentConstructor.prototype);
  merge(C.prototype, proto);
  return C;
}

export function resolveHook(obj, hookName) {
  if (!obj) { return; }
  var underscored = "_" + hookName;
  return obj[underscored] && underscored ||
         obj[hookName] && hookName;
}

export function callHook(obj, _hookName, arg1, arg2) {
  var hookName = resolveHook(obj, _hookName);
  return hookName && obj[hookName].call(obj, arg1, arg2);
}

export function applyHook(obj, _hookName, args) {
  var hookName = resolveHook(obj, _hookName);
  if (hookName) {
    if (args.length === 0) {
      return obj[hookName].call(obj);
    } else if (args.length === 1) {
      return obj[hookName].call(obj, args[0]);
    } else if (args.length === 2) {
      return obj[hookName].call(obj, args[0], args[1]);
    } else {
      return obj[hookName].apply(obj, args);
    }
  }
}

export default { Promise: (typeof global === 'undefined' ? self : global).Promise };
