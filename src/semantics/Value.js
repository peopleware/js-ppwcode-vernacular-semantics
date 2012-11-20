define(["dojo/_base/declare", "./PpwCodeObject", "ppwcode/contracts/_Mixin"],
    function(declare, PpwCodeObject, _ContractMixin) {

      return declare("be.ppwcode.vernacular.semantics.Value", [PpwCodeObject, _ContractMixin], {
// immutable

        _c_invar: [

        ],

        constructor: function(/*Object*/ props) {
          var thisEntity = this;
          this._c_pre(function() {return (props != null);});

          // NOP
        },

        equals: function(/*Value*/ other) {
          throw "ABSTRACT";
          return false; // return boolean
        }

      });
    }
);
