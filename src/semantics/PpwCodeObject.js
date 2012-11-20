define(["dojo/_base/declare", "ppwcode/contracts/_Mixin"],
    function(declare, _ContractMixin) {

      return declare("be.ppwcode.vernacular.semantics.PpwCodeObject", [_ContractMixin], {

        _c_invar: [
          // MUDO nothing here yet
        ],


        "-chains-": {
          reload: "after",
          _extendJsonObject: "after",
          _stateToString: "after"
        },

        constructor: function(/*Object*/ props) {
          // NOP
        },

        reload: function(/*Object*/ json) {
          // NOP
        },

        _extendJsonObject: function(/*Object*/ json) {
          // NOP
        },

        toJsonObject: function() {
          var json = {};
          this._extendJsonObject(json);
          return json; // return Object
        },

        _stateToString: function(/*Array of String*/ toStrings) {
          // NOP
        },

        toString: function() {
          var toStrings = [];
          this._stateToString(toStrings);
          return this.declaredClass + // return Object
              " {" + toStrings + "}";
        }
      });
    }
);
