/*
 Copyright 2012 - $Date $ by PeopleWare n.v.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

define(["dojo/_base/declare", "./PpwCodeObject", "dojo/Stateful", "dojo/when", "ppwcode-util-oddsAndEnds/js",
        "ppwcode-vernacular-exceptions/SemanticException", "ppwcode-vernacular-exceptions/CompoundSemanticException", "ppwcode-vernacular-exceptions/PropertyException"],
    function(declare, PpwCodeObject, Stateful, when, js,
             SemanticException, CompoundSemanticException, PropertyException) {

      /*
         NOTE:

         This class combines some of our own ppwcode stuff with dojo/Stateful stuff.
         Stateful has a number of annoying features, which we started working around.
         In a later version, we probably should consolidate the code in here, and
         thus no longer inherit from Stateful.
         For now, we keep inheritance, to track the evolution of Stateful. Changes
         might happen in later versions, and we would want to see those.
         Below, we HACK to solve these issues.

         The adaptations we make here are:

         1) In postscript, which is executed as the last step in construction, all
            properties of the kwargs of the constructor which are not yet set, are copied
            to the prototype. We don't want this. We only want properties that we define
            in the class, no strange stuff. Secondly, this is too early, in the constructor
            chain.
         2) Both set and _changeAttrValue should not do anything, and certainly not send events,
            if the new value is the same as the old value. The remaining problem is what
            "the same" means. We now use "!=", but we might need to change that further
            later.
         3) Setters and getters might change a value that is submitted or retrieved.
            If this is not allowed, it does not make much sense to have setters and getters
            in the first place (the same applies to validation, BTW).
            But if a setter or a getter does not exactly copy the given value, the events
            that are sent out must sent the actual new value, not the submitted new value.
            This means that set and _changeAttrValue must use the setter and getter in any
            case (even if value == oldValue), and 2) is incomplete. For 2), we fall back
            to the minimum requirement, certainly not to send events.
       */

      // HACK Stateful adapation: Do not blindly copy all properties of the kwargs
//      var statefulPrototype = Stateful.prototype;
//      delete statefulPrototype.postscript;
      // now hack is replaced by overriding postscript in our class; no side effects that way

      function areDifferentValues(newValue, oldValue) {
        var result;
        switch (js.typeOf(newValue)) {
          case "array":
            result = (js.typeOf(oldValue) !== "array") ||
              newValue.some(function(element, index) {
                return areDifferentValues(element, oldValue[index]);
              });
            break;
          default:
            result = (newValue != oldValue);
        }
        return result;
      }

      return declare([PpwCodeObject, Stateful], {

        _c_invar: [
          function() {return this._c_prop_bool("editable")},
          function() {return this._c_prop_mandatory("editable")},
          function() {return this._c_prop_bool("deletable")},
          function() {return this._c_prop_mandatory("deletable")}
        ],

        "-chains-": {
          _extendJsonObject: "after",
          _stateToString: "after",
          reload: "after"
        },

        // lastReloaded: Date?
        //   The time of last reload.
        lastReloaded: null,

        constructor: function() {
          var self = this;
          var previousWildExceptions = {wildExceptions: new CompoundSemanticException()};
          var holisticWildExceptionsListener = self.watch(function(propertyName) {
            if (!propertyName || propertyName.indexOf("wildExceptions") < 0) { // otherwise we have a loop
              var currentWildExceptions = self.getWildExceptions();
              var perProperty = currentWildExceptions.children.reduce(
                function(acc, semanticException) {
                  if (semanticException.isInstanceOf(PropertyException) && semanticException.sender === self) {
                    if (!acc[semanticException.propertyName]) {
                      acc[semanticException.propertyName] = new CompoundSemanticException();
                    }
                    acc[semanticException.propertyName].add(semanticException);
                  }
                  return acc;
                },
                {wildExceptions: currentWildExceptions}
              );
              for (var propName in perProperty) {
                if (previousWildExceptions[propName] ?
                    !perProperty[propName].like(previousWildExceptions[propName]) :
                    !perProperty[propName].isEmpty()) {
                  var pseudoPropName = (propName === "wildExceptions" ? propName : propName + "-wildExceptions");
                  self._watchCallbacks(pseudoPropName, previousWildExceptions[propName], perProperty[propName]);
                  previousWildExceptions[propName] = perProperty[propName];
                }
              }
            }
          });
        },

        postscript: function() {
          // summary:
          //   Does nothing. This method is here to override the
          //   stupid implementation of Stateful.

          this._c_NOP();
        },

        set: function(/*String*/name, /*Object*/value) {
          // Code copied from dojo/Stateful
          if(typeof name === "object"){
            for(var x in name){
              if(name.hasOwnProperty(x) && x !="_watchCallbacks"){
                this.set(x, name[x]);
              }
            }
            return this;
          }

          var names = this._getAttrNames(name);
          var oldValue = this._get(name, names);
          var setter = this[names.s];
          if (typeof setter === "function") {
            // use the explicit setter
            setter.apply(this, Array.prototype.slice.call(arguments, 1));
          } else {
            // no setter so set attribute directly
            this._changeAttrValue(name, value);
          }
          return this; // return SemanticObject
        },

        _changeAttrValue: function(name, value) {
          var oldValue = this.get(name);
          this[name] = value;
          if(this._watchCallbacks) {
            // HACK send the actual new value in the event, not the supplied value
            var newValue = this.get(name);
            // HACK only send if something changed; changed takes into account array-values
            if (areDifferentValues(newValue, oldValue)) {
              // HACK send the actual new value in the event, not the supplied value
              this._watchCallbacks(name, oldValue, newValue);
            }
          }
          return this; // return SemanticObject
        },

        _editableSetter: function(value) {
          // summary:
          //   Default is that this cannot be set in the application, but can be overridden.

          throw "ERROR: editable is read-only - calculated in the server";
        },

        _editableGetter: function() {
          // summary:
          //   Default is true, but can be overridden.

          return true;
        },

        _deletableSetter: function(value) {
          // summary:
          //   Default is that this cannot be set in the application, but can be overridden.

          throw "ERROR: deletable is read-only - calculated in the server";
        },

        _deletableGetter: function() {
          // summary:
          //   Default is true, but can be overridden.

          return true
        },

        _wildExceptionsGetter: function() {
          // summary:
          //   Watchable property that reports the current wildExceptions for all properties of this object.

          return this.getWildExceptions();
        },

        _wildExceptionsSetter: function() {
          throw "ERROR: wild exceptions cannot be set.";
        },

        getWildExceptions: function(/*String?*/ propertyName, /*CompoundPropertyException?*/ compoundSemanticException) {
          // summary:
          //   Get the wild exceptions for the current state of this concerning `propertyName`, or the entire object
          //   if no propertyName is given. This method always returns an unclosed CompoundPropertyException, which
          //   might be empty.
          //   If a CompoundPropertyException is given as the second argument, it is returned, with optionally
          //   children added to it. If no second argument is given, a new CompoundPropertyException is returned.
          // description:
          //   To calculate the wild exceptions for a given property, add a method with name "_PROPERTYNAMEValidator".
          //   It will be called with the current value of the given property as argument. The method must return an array
          //   always, that might be empty. The elements of the array are, or represent, SemanticExceptions.
          //   If the element is not a SemanticException, but a String, we create a PropertyException for you,
          //   for the property we are validating with this as sender. The String is used as key. Otherwise,
          //   we will interpret the element as kwargs for the construction of a new PropertyException, if we find
          //   a sender or a propertyName in there.
          //   Other elements are not allowed.
          //
          //   Pseudo-properties exist for the validation of each property, and the object as a whole. These are provided
          //   to make it possible to bind to the validation state of each property or the object as a whole. Events
          //   are send for the pseudo-properties when the validation state of a property changes.
          //   The name of the pseudo-property for a given PROPERTYNAME is "PROPERTYNAME-wildExceptions".
          //   The name of the pseudo-property for the object as a whole is "wildExceptions".

          var self = this;
          var cpe = compoundSemanticException || new CompoundSemanticException();
          if (propertyName || propertyName === "") {
            var validatorName = "_" + propertyName + "Validator";
            var validator = self[validatorName];
            if (js.typeOf(validator) === "function") {
              var currentValue = self.get(propertyName);
              var validatorResult = validator.call(self, currentValue);
              if (!js.typeOf(validatorResult)) {
                throw "ERROR: validator must return an array (" + validatorName + " on " + self.toString() + ")";
              }
              validatorResult.forEach(function(wildExceptionDefinition) {
                if (js.typeOf(wildExceptionDefinition) === "string") {
                  // just a key; create a PropertyException for this propertyName and this
                  cpe.add(new PropertyException({key: wildExceptionDefinition, sender: self, propertyName: propertyName}));
                }
                else if (wildExceptionDefinition.isInstanceOf && wildExceptionDefinition.isInstanceOf(SemanticException)) {
                  cpe.add(wildExceptionDefinition);
                }
                else if (wildExceptionDefinition.sender || wildExceptionDefinition.propertyName) {
                  // we interpret it as the kwargs of a PropertyException if we have a sender or a propertyName
                  cpe.add(new PropertyException(wildExceptionDefinition));
                }
                else {
                  throw "ERROR: could not interpret validator result " + wildExceptionDefinition + " (" + validatorName + " on " + self.toString() + ")";
                }
              });
            }
            // else, return the empty cpe
          }
          else { // validate the whole object
            var allKeys = js.getAllKeys(self);
            allKeys.forEach(function(possiblePropertyName) {
              self.getWildExceptions(possiblePropertyName, cpe);
            });
          }
          return cpe; // return CompoundPropertyException
        },

        getLabel: function(/*Object*/ options) {
          // summary:
          //   Semantic view model objects are often represented as a label.
          //   This method should return a string that represents this semantic object.
          // options: Object
          //   options.locale is the language the UI asks the label in; for semantic objects
          //   this can often be ignored
          //   options.formatLength can be "long" or "short" (the default); mainly, in an object
          //   graph, we need to show more than only local information for the user to recognize
          //   an object. It is good practice then to add the short label of parent objects
          //   in brackets after the local information. To avoid very long labels, the label
          //   of the parent should be short, and parent information should only be added if
          //   the UI requests a long label.
          // description:
          //   Subclasses should override this with a meaningful implementation. The default is toString.

          return this.toString();
        },

        reload: function(/*Object*/ json) {
          // summary:
          //   Chained method that loads data from `json`.
          // description:
          //   Subclasses should overwrite this method
          //   to load the properties from `json` that are defined
          //   in that subclass.
          //   See also _extendJsonObject.
          //   The time of reload is remembered in lastReloaded.

          this._changeAttrValue("lastReloaded", new Date());
        },

        _extendJsonObject: function(/*Object*/ json) {
          this._c_NOP(json);
        },

        _stateToString: function(/*Array of String*/ toStrings) {
          this._c_NOP(toStrings);
        }

      });
    }
);
