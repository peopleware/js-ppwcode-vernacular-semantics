define(["dojo/_base/declare", "dojo/Stateful", "ppwcode/contracts/_Mixin"],
    function(declare, Stateful, _ContractMixin) {

      /*
         NOTE!:
         Stateful has an annoying feature, is postscript (executed as the
         last step in construction): all properties of the kwargs of the
         constructor are copied to the prototype. We don't want this.
       */
      var statefulPrototype = Stateful.prototype;
      delete statefulPrototype.postscript;

      var SemanticObject = declare("be.ppwcode.vernacular.semantics.SemanticObject",
                                   [Stateful, _ContractMixin], {

        _c_invar: [
          // MUDO nothing here yet
        ],


        "-chains-": {
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

      return SemanticObject;
    }
);
