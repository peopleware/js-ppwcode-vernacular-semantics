define(["dojo/_base/declare", "./PpwCodeObject", "ppwcode-util-contracts/_Mixin",
        "ppwcode-util-oddsAndEnds/js", "module"],
    function(declare, PpwCodeObject, _ContractMixin,
             js, module) {

      var Value = declare([PpwCodeObject, _ContractMixin], {
        // summary:
        //   Values are immutable after construction.
        //   They are constructed with a kwargs argument.
        //   For JSON-inification, toString, typeDescription, see PpwCodeObject.
        // description:
        //   Constructors of concrete types should have a property format
        //   and parse, that are functions that can format (turn into a user-oriented
        //   string) instances of that type, and parse strings into instances
        //   of that type.
        //   format: Value x Options --> String
        //   parse: String x Options --> Value, ParseException

        _c_invar: [

        ],

        constructor: function(/*Object*/ props) {
          this._c_pre(function() {return props /* exists and not null */;});
          this._c_pre(function() {return js.typeOf(props) === "object";});

          this._c_NOP(props);
        },

        compare: function(/*Value*/ other) {
          // summary:
          //   Return a negative number if this is considered smaller than other;
          //   return a positive number if this is considered larger than other;
          //   return 0 is this.equals(other)
          // description:
          //   This method should return consistent results: given a this and an other,
          //   it should return the same result whenever the method is called, during
          //   the entire live time of the object.
          //   This extra requirement can be asked of Values, since they are immutable.
          //   This method should realize a total order: it should be complete,
          //   transitive, and anti-symmetric.
          //
          //   The pattern to express `this # other` is `this.compare(other) # 0`, with
          //   # either <, =, or >.
          //
          //   In the order, undefined comes first and null comes second. However, it is impossible
          //   to compare null and undefined, since neither can be used as the left-side in calling this method.
          // tags:
          //   public extension
          this._c_pre(function() {return !other || (other.isInstanceOf && other.isInstanceOf(this.constructor));});

          return this._c_ABSTRACT(); // return Number
        },

        equals: function(/*Value*/ other) {
          // summary:
          // description:
          //   Must be overriden in subtypes with the pattern:
          //   | return this.inherited(arguments) && (EXTRA CONDITIONS);
          //   This implementation checks whether other is null.
          //
          //   This method is also used by dojox/mvc/sync! There can be no preconditions!
          // tags:
          //   public extension

          // Note: not a good candidate for chaining: look at what the overrider should write (it is the same)

          // we force to actually return a Boolean (!!)

          return !!(other && // return boolean
                    other.constructor &&
                    (other.constructor === this.constructor)); // same type;
        },

        getValue: function() {
          this._c_ABSTRACT();
          return null; // return object
        },

        canCoerceTo: function() {
          // summary:
          //   Array of the types this can coerceTo. Types to which we coerce with more
          //   of our information intact should come earlier than types to which we coerce
          //   with more loss of information.

          return [this.constructor];
        },

        coerceTo: function(/*Function*/ Type) {
          // summary:
          //   Try to return a value of Type, that is similar to this.
          //   It might contain less information.
          //   If this is not possible, returns undefined.
          //   The default implementation returns this only for its exact type, and undefined otherwise.

          function coercionChain(FromType) {
            if (FromType.prototype.canCoerceTo().indexOf(Type) >= 0) {
              return [Type];
            }
            // else, maybe one of the types FromType can coerce to, can itself coerce to Type
            var FromFromTypes = FromType.prototype.canCoerceTo();
            var FromFromType = FromFromTypes.shift();
            while (FromFromType) {
              if (FromFromType !== FromType) { // otherwise we have an infinite loop
                var partialChain = coercionChain(FromFromType);
                if (partialChain) { // we have a solution
                  partialChain.shift(FromFromType);
                  return partialChain;
                }
              }
              FromFromType = FromFromTypes.shift();
            }
            // we have no solution
            return undefined;
          }

          var chain = coercionChain(this.constructor);
          if (chain) {
            return chain.reduce(
              function(acc, ToType) {
                return acc._coerceTo(ToType);
              },
              this
            );
          }
          else {
            return undefined;
          }
        },

        _coerceTo: function(/*Function*/ Type) {
            // summary:
            //   Try to return a value of Type, that is similar to this.
            //   It might contain less information. NEVER coerce to a Type that requires more information,
            //   e.g., by using a default for the missing information. This will result in module dependency
            //   cycles!
            //   If this is not possible, return undefined.
            //   The default implementation returns this only for its exact type, and undefined otherwise.

          if (Type === this.constructor) {
            return this;
          }
          return undefined;
        }

      });

      Value.mid = module.id;

      return Value;
    }
);
