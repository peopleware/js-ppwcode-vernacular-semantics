define(["dojo/_base/declare", "ppwcode/contracts/_Mixin", "dojo/_base/kernel"],
    function(declare, _ContractMixin, kernel) {

      return declare([_ContractMixin], {

        _c_invar: [
          // MUDO nothing here yet
        ],

        "-chains-": {
          reload: "after",
          _extendJsonObject: "after",
          _stateToString: "after"
        },

        constructor: function(/*Object*/ props) {
          this._c_NOP(props);
        },

        isEditable: function() { return true; },
        isDeletable: function() { return true },

        reload: function(/*Object*/ json) {
          // summary:
          //   Chained method that loads data from `json`.
          // description:
          //   Subclasses should overwrite this method
          //   to load the properties from `json` that are defined
          //   in that subclass.
          //   See also _extendJsonObject.

          this._c_NOP(json);
        },

        _extendJsonObject: function(/*Object*/ json) {
          // summary:
          //   Chained method that writes data to `json`.
          //   Called by toJSON.
          // description:
          //   Subclasses should overwrite this method
          //   to write the properties to `json` that are defined
          //   in that subclass.
          //   See also reload.
          // tags:
          //   protected extension

          this._c_NOP(json);
        },

        toJSON: function() {
          // summary:
          //   Standard JavaScript function called by
          //   JSON.stringify when available.
          //   Calls this._extendJsonObject, which
          //   is chained. Subclasses should overwrite
          //   this method to control exactly what
          //   is serialized. By default, nothing is serialized
          //   and an empty object is returned.
          // description:
          //   See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON

          var json = {};
          this._extendJsonObject(json);
          return json; // return Object
        },

        toJsonObject: function() {
          // summary:
          //   Deprecated. Use toJSON instead. Will be removed soon.

          kernel.deprecated("ppwcode/semantics/PpwCodeObject.toJsonObject.",
                            "Provide the object itself (using toJSON instead).",
                            "Before 1.0.");
          var json = {};
          this._extendJsonObject(json);
          return json; // return Object
        },

        _stateToString: function(/*Array of String*/ toStrings) {
          // tags:
          //   protected extension

          this._c_NOP(toStrings);
        },

        getTypeDescription: function() {
          // summary:
          //   A string describing the type of this instance for toString.
          // description:
          //   The default is the declared class. Subtypes can override.
          // tags
          //   protected extension

          return this.declaredClass;
        },

        toString: function() {
          var toStrings = [];
          this._stateToString(toStrings);
          return this.getTypeDescription() + // return String
              " {" + toStrings + "}";
        }
      });
    }
);
