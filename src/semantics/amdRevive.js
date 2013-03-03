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


    function revive(/*Object*/ graphRoot, /*String*/ serverTypeJsonPropertyName, /*Function*/ serverType2Mid) {
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

      function cachedResult(cachedValue) {
        var matches = cache.filter(function(element) {
          return element.value === cachedValue; // also matches null; don't put null in the cache
        });
        if (matches.length > 1) {
          throw "ERROR: more than 1 match in cache";
        }
        else if (matches.length == 1) {
          return matches[0];
        }
        else {
          return undefined;
        }
      }

      function reviveBackTrack(/*Object*/ value) {
        // summary:
        //    Returns a Promise for a result, or a result, transforming
        //    value, deep, depth-first, to a graph of instances of classes
        //    whose type is defined in "$type"-properties in objects
        //    in this graph.
        //    Primitives are just kept what they are. Arrays and objects
        //    are replaced, so that the orginal structure is unchanged.
        if (!value) {
          // all falsy's can be returned immediately
          return value; // return Object
        }

        var valueType = toType(value);
        if (valueType === "string"  ||
            valueType === "boolean" ||
            valueType === "number"  ||
            valueType === "json"    ||
            valueType === "math"    ||
            valueType === "regexp"  ||
            valueType === "date"    ||
            valueType === "error") {
          // no processing required
          return value; // return Object
        }

        var cachedResult = cachedResult(value);
        if (cachedResult) {
          // we already encountered this value (by reference)
          // return the promise or value we have already
          return cachedResult.promise; // return Promise
        }

        // object, array, arguments: many intermediate steps
        var deferred = new Deferred();  // return Object
        // cache the value before we go deep, without the promise for a result
        var cacheEntry = { value: value, promise: deferred.promise };
        cache.push(cacheEntry);

        if (valueType === "arguments" || valueType === "array") {
          // go deep
          // don't use map, because arguments doesn't support it
          var newStructure = []; // start by storing the promises, replace when resolved
          for (var i = 0; i < value.length; i ++) {
            var iResultOrPromise = reviveBackTrack(value[i]);
            newStructure[i] = (function(j) { // function to encapsulate counter i in arg j, for later
              var whenResult = when(
                iResultOrPromise,
                function(iResult) {
                  newStructure[j] = iResult;
                  return iResult;
                },
                function(iErr) {
                  newStructure[j] = iErr;
                  return iErr;
                }
              );
              return whenResult;
            })(i);
          }
          all(newStructure).then(
            // all does when internally
            function(aResults) {
              deferred.resolve(aResults);
              return aResults;
            },
            function(aErrors) {
              deferred.reject(aErrors);
              return aErrors;
            }
          );
        }
        else if (valueType === "object") {
          var properties = Object.keys(value);
          var intermediateObject = properties.reduce(
            function(acc, pName) {
              var pNameResultOrPromise = reviveBackTrack(value[pName]);
              acc[pName] = when(
                pNameResultOrPromise,
                function(pNameResult) {
                  acc[pName] = pNameResult;
                  return pNameResult;
                },
                function(pNameErr) {
                  acc[pName] = pNameErr;
                  return pNameErr;
                }
              );
              return acc[pName];
            }
          );

          if (properties.some(function(p) { return p === serverTypeJsonPropertyName; } )) {
            // json object has "$type" property; it is a serialized version of a Jsonifiable object.
            var mid = serverType2Mid(value[serverTypeJsonPropertyName]); // we can use the original value: strings are not revived in any special way
            var requireErrorHandle = require.on("error", function(err) {
              requireErrorHandle.remove(); // handler did its work
              deferred.reject(err); // this turns out to be a different structure than documented, but whatever
              // can't return anything here
            });
            require([mid], function(Constructor) {
              requireErrorHandle.remove(); // require worked successfully
              var fresh = new Constructor();
              all(intermediateObject).then(
                function(revivedKwargs) {
                  try {
                    fresh.reload(revivedKwargs);
                    deferred.resolve(fresh);
                    return fresh;
                  }
                  catch(exc) {
                    deferred.reject(exc);
                    return exc;
                  }
                },
                function(e) {
                  deferred.reject(e);
                  return e;
                }
              );
            });
          }
          else {
            // a simple object
            all(intermediateObject).then(
              // all does when internally
              function(oResults) {
                deferred.resolve(oResults);
                return oResults;
              },
              function(oErrors) {
                deferred.reject(oErrors);
                return oErrors;
              }
            );
          }
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
