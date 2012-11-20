define(["dojo/_base/declare", "./PpwCodeObject", "dojo/Stateful", "ppwcode/contracts/_Mixin"],
    function(declare, PpwCodeObject, Stateful, _ContractMixin) {

      /*
         NOTE!:
         Stateful has an annoying feature, is postscript (executed as the
         last step in construction): all properties of the kwargs of the
         constructor are copied to the prototype. We don't want this.
       */
      var statefulPrototype = Stateful.prototype;
      delete statefulPrototype.postscript;

      return declare("be.ppwcode.vernacular.semantics.SemanticObject", [PpwCodeObject, Stateful, _ContractMixin], {

        _c_invar: [
          // MUDO nothing here yet
        ],

        constructor: function(/*Object*/ props) {
          // NOP
        },

        _extendJsonObject: function(/*Object*/ json) {
          // NOP
        },

        _stateToString: function(/*Array of String*/ toStrings) {
          // NOP
        }

      });
    }
);
