define(["dojo/_base/declare", "./PpwCodeObject", "dojo/Stateful", "dojo/when", "ppwcode-util-oddsAndEnds/js"],
    function(declare, PpwCodeObject, Stateful, when, js) {

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

          var names = this._getAttrNames(name),
            oldValue = this._get(name, names),
            setter = this[names.s],
            result;
          if (typeof setter === "function") {
            // use the explicit setter
            result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
          } else {
            // no setter so set attribute directly
            this[name] = value;
          }
          if(this._watchCallbacks) {
            // HACK send the actual new value in the event, not the supplied value
            var newValue = this.get(name);
            // HACK only send if something changed; changed takes into account array-values
            if (areDifferentValues(newValue, oldValue)) {
              var self = this;
              // If setter returned a promise, wait for it to complete, otherwise call watches immediately
              when(result, function() {
                // HACK send the actual new value in the event, not the supplied value
                self._watchCallbacks(name, oldValue, newValue);
              });
            }
          }
          return this; // return be.ppwcode-vernacular-semantics.SemanticObject
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
