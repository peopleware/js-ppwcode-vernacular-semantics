define(["dojo/_base/declare", "dojo/Stateful", "ppwcode_contracts/_Mixin"],
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

        // MUDO nothing here yet

        constructor: function(/*Object*/ props) {
          // NOP
        },

        reload: function(/*Object*/ json) {
          // NOP
        },

        toJsonObject: function() {
          var json = {};
          return json; // return Object
        },

        _stateToString: function() {
          return ""; // return String
        },

        toString: function() {
          return this.declaredClass + // return Object
            " {" + this._stateToString() + "}";
        }
      });

      return SemanticObject;
    }
);
