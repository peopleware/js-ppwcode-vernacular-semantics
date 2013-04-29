define(["dojo/_base/declare", "./PpwCodeObject", "ppwcode/contracts/_Mixin",
        "ppwcode/oddsAndEnds/js"],
    function(declare, PpwCodeObject, _ContractMixin,
             js) {

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

          // Note: not a good candidate for chaining: look at what the overrider shoud write (it is the same)
          this._c_pre(function() {
            return other === null ||
              (other && other.constructor && (other.constructor === this.constructor)); // same type
          });

          return true; // return boolean
        },

        getValue: function() { // TODO what is this method for? Remove it?
          this._c_ABSTRACT();
          return null; // return object
        }

      });

      return Value;
    }
);
