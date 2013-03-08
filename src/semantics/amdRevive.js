define(["dojo/Deferred", "dojo/promise/all", "dojo/when", "require"],
  function(Deferred, all, when, require) {

    function toType(obj) {
      // more than lang.isObject etc.
      /*
       http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/

       but with a better toString, and a final ;
      */
      /*
       toType({a: 4}); //"object"
       toType([1, 2, 3]); //"array"
       (function() {console.log(toType(arguments))})(); //arguments
       toType(new ReferenceError); //"error"
       toType(new Date); //"date"
       toType(/a-z/); //"regexp"
       toType(Math); //"math"
       toType(JSON); //"json"
       toType(new Number(4)); //"number"
       toType(new String("abc")); //"string"
       toType(new Boolean(true)); //"boolean"
      */

      return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

      // TODO fails with null, I think
    }


    function canUseAsIs(valueType) {
      return valueType === "string" ||
        valueType === "boolean" ||
        valueType === "number" ||
        valueType === "json" ||
        valueType === "math" ||
        valueType === "regexp" ||
        valueType === "date" ||
        valueType === "error";
    }

    function revive(/*Object*/ graphRoot, /*String*/ serverTypeJsonPropertyName, /*Function*/ serverType2Mid) {
      // summary:
      //    Returns a Promise for a result, or a result, transforming
      //    value, deep, depth-first, to a graph of instances of classes
      //    whose type is defined in "serverTypeJsonPropertyName"-properties in objects
      //    in this graph.
      //    Primitives are just kept what they are. Arrays and objects
      //    are replaced, so that the orginal structure is unchanged.
      // graphRoot: Object
      //   Anything, root of the graph to revive. Intended to be the naked object
      //   graph, after JSON.parse of a JSON structure, but can deal with more.
      // serverTypeJsonPropertyName: String
      //   The name of a property that we look for in an object in the value-graph.
      //   If present, we will transform its owner object into a PpwCodeObject
      //   of the correct type.
      //   It should contain a string representation of the type of the object as
      //   it is known on the server.
      //   `serverType2Mid` will be given the value of this property, to decide on
      //   module to load. This module should return a constructor for a subclass
      //   of PpwCodeObject.
      // serverType2Mid: Function
      //   String --> String
      //   Will be called with the value of type-properties of objects in the value-graph,
      //   and is expected to return the MID of the class in JavaScript that matches
      //   the server type defined by the given type-property.
      //   We suggest to use Convention over Configuration here, to have an easy conversion,
      //   but in general, this may be a dictionary lookup.

      var cache = [];
      // we only cache arrays, objects,
      // this is the reason for the call of reviveBackTrack method inside revive: this is shared
      // between all calls of reviveBackTrack inside one call of revive

      function getCachedResult(/*Object*/ cachedValue) {
        var matches = cache.filter(function(element) {
          return element.value === cachedValue; // also matches null; don't put null in the cache
        });
        if (matches.length > 1) {
          throw "ERROR: more than 1 match in cache";
        }
        else if (matches.length == 1) {
          return matches[0].result;
        }
        else {
          return undefined;
        }
      }

      function processArrayElements(/*Array|Arguments*/ ar) {
        var newAr = []; // start by storing the promises, replace when resolved
        for (var i = 0; i < ar.length; i++) {
          var iResultOrPromise = reviveBackTrack(ar[i]);
          newAr[i] = (function (j) { // function to encapsulate counter i in arg j, for later
            var whenResult = when(
              iResultOrPromise,
              function (iResult) {
                newAr[j] = iResult;
                return iResult;
              },
              function (iErr) {
                newAr[j] = iErr;
                return iErr;
              }
            );
            return whenResult;
          })(i);
        }
        return newAr;
      }

      function processArrayLike(/*Array|Arguments*/ ar, /*Deferred*/ deferred) {
        var newAr = processArrayElements(ar);
        all(newAr).then(
          // all does when internally
          function (aResults) {
            deferred.resolve(aResults);
            return aResults;
          },
          function (aErrors) {
            deferred.reject(aErrors);
            return aErrors;
          }
        );
      }

      function preProcessObjectElements(/*Object*/ o) {
        var intermediateObject = Object.keys(o).reduce(
          function (acc, pName) {
            var pNameResultOrPromise = reviveBackTrack(o[pName]);
            acc[pName] = when(
              pNameResultOrPromise,
              function (pNameResult) {
                acc[pName] = pNameResult;
                return pNameResult;
              },
              function (pNameErr) {
                acc[pName] = pNameErr;
                return pNameErr;
              }
            );
            return acc[pName];
          },
          {} // a fresh intermediate object
        );
        return intermediateObject;
      }

      function isTypedObject(/*Object*/ o) {
        // json object has "serverTypeJsonPropertyName" property
        return Object.keys(o).some(function (p) {
          return p === serverTypeJsonPropertyName;
        });
      }

      function processTypedObject(/*Object*/ o, /*Deferred*/ deferred, /*Object*/ intermediateObject) {
        var mid = serverType2Mid(o[serverTypeJsonPropertyName]);
          // we don't want to wait for the promises on the intermediateObject
          // we can use the original value: strings are not revived in any special way
        var requireErrorHandle = require.on("error", function (err) {
          requireErrorHandle.remove(); // handler did its work
          deferred.reject(err); // this turns out to be a different structure than documented, but whatever
          // can't return anything here
        });
        require([mid], function (Constructor) {
          requireErrorHandle.remove(); // require worked successfully
          var fresh = new Constructor();
          all(intermediateObject).then(
            function (revivedKwargs) {
              try {
                fresh.reload(revivedKwargs);
                deferred.resolve(fresh);
                return fresh;
              }
              catch (exc) {
                deferred.reject(exc);
                return exc;
              }
            },
            function (e) {
              deferred.reject(e);
              return e;
            }
          );
        });
      }

      function processSimpleObject(/*Object*/ intermediateObject, /*Deferred*/ deferred) {
        all(intermediateObject).then(
          // all does when internally
          function (oResults) {
            deferred.resolve(oResults);
            return oResults;
          },
          function (oErrors) {
            deferred.reject(oErrors);
            return oErrors;
          }
        );
      }

      function processObject(/*Object*/ o, /*Deferred*/ deferred) {
        var intermediateObject = preProcessObjectElements(o);
        if (isTypedObject(o)) {
          // json object has "serverTypeJsonPropertyName" property; it is a serialized version of a Jsonifiable object.
          processTypedObject(o, deferred, intermediateObject);
        }
        else {
          // a simple object
          processSimpleObject(intermediateObject, deferred);
        }
      }

      function reviveBackTrack(/*Object*/ value) {
        // decription:
        //    inner method in revive, because all calls of this method
        //    inside one revive call need to share the cache
        if (!value) {
          // all falsy's can be returned immediately
          return value; // return Object
        }
        var valueType = toType(value);
        if (canUseAsIs(valueType)) {
          // no processing required
          return value; // return Object
        }
        var cachedResult = getCachedResult(value);
        if (cachedResult) {
          // we already encountered this value (by reference: we only cache objects and arrays)
          // return the reference to the result
          // it might be filled in already, or not, but it will be soon
          // in any case, since this is in the cache, it is not the root object,
          // so we don't need to return a promise. The root-promise will wait
          // until this result is filled out, via the original entry, anyway
          return cachedResult; // return Object|Array
        }

        // object, array, arguments: many intermediate steps
        var deferred = new Deferred();  // return Object
        // cache the reference to the new structure before we go deep;
        // it is empty still, but we will fill it up before we return
        var newStructure;
        if (valueType === "arguments" || valueType === "array") {
          newStructure = [];
        }
        else if (valueType === "object") {
          if (isTypedObject(value)) {
            newStructure = CAN'T DO THIS: ASYNC!!!! so what is in the cache again is a Promise
          }
          else {
            newStructure = {};
          }
        }


        cache.push({ value: value, result: newStructure });
        if (valueType === "arguments" || valueType === "array") {
          // go deep
          // don't use map, because arguments doesn't support it
          processArrayLike(value, deferred);
        }
        else if (valueType === "object") {
          processObject(value, deferred);
        }
        else {
          // includes undefined
          throw "ERROR: impossible type (type of '" + value + "' cannot be " + valueType + ")";
        }
        return deferred.promise; // return Promise
        // TODO WHAT ABOUT PROPERTIES OF TYPE CONSTRUCTOR?
      }

      // the real method
      var topResultOrPromise = reviveBackTrack(graphRoot);
      return topResultOrPromise; // return /*Object|Promise*/

    }

    return revive;

  }
);
