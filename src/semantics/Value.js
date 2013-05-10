define(["dojo/_base/declare", "./PpwCodeObject", "ppwcode/contracts/_Mixin",
        "ppwcode/oddsAndEnds/js", "module"],
    function(declare, PpwCodeObject, _ContractMixin,
             js, module) {

      var Value = declare([PpwCodeObject, _ContractMixin], {
        // summary:
        //   Values are immutable after construction.
        //   They are constructed with a kwargs argument.
        //   For JSON-inification, toString, typeDescription, see PpwCodeObject.

        _c_invar: [

        ],

        constructor: function(/*Object*/ props) {
          this._c_pre(function() {return props /* exists and not null */;});
          this._c_pre(function() {return js.typeOf(props) === "object";});

          this._c_NOP(props);
        },

        equals: function(/*Value*/ other) {
          // summary:
          // description:
          //   Must be overriden in subtypes with the pattern:
          //   | return this.inherited(arguments) && (EXTRA CONDITIONS);
          //   This implementation checks whether other is null.
          //
          //   This method is also used by dojox/mvc/sync! There can be no preconditions!

          // Note: not a good candidate for chaining: look at what the overrider should write (it is the same)

          return other && // return boolean
            other.constructor &&
            (other.constructor === this.constructor); // same type;
        },

        getValue: function() { // TODO what is this method for? Remove it?
          this._c_ABSTRACT();
          return null; // return object
        }

      });

      Value.persistenceType = module.id;

      return Value;
    }
);
