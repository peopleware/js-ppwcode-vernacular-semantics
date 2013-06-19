define(["dojo/_base/declare", "./Value",
        "ppwcode/oddsAndEnds/js"
],
  function(declare, Value,
           js) {

    var EnumerationValue = declare([Value], {
      // summary:
      //   Support for enum types.
      //   Values of enum types are communicated to and from the server as Strings in JSON.
      // description:
      //   Enumeration types should be defined as a hash of the EnumerationValues.
      //   This class thus defines the values, but not the type.
      //   This hash is referenced with a Capitalized name, like a Constructor (although it is an object,
      //   and not a function).

      _c_invar: [
        function() {return js.typeOf(this.toJSON()) === "string" && this.toJSON() != "";}
      ],

      // _representation: String
      //   The internal representation of the value.
      //   This string is used in communication to and from the server.
      _representation: null,

      constructor: function(/*Object*/ kwargs) {
        this._c_pre(function() {return this._c_prop_mandatory(kwargs, "representation");});
        this._c_pre(function() {return this._c_prop_string(kwargs, "representation");});

        this._representation = kwargs.representation;
      },

      isValueOf: function(/*Object*/ EnumDef) {
        // summary:
        //   Is this defined in `EnumDef`?
        // description:
        //   Similar to isInstanceOf.
        //   Note: with the current implementation of declare, we cannot overwrite isInstanceOf.
        //   (the declare definition of isInstanceOf overwrites anything we declare).

        return Object.keys(EnumDef).some(function(ed) {return EnumDef[ed];});
      },

      equals: function(/*EnumerationValue*/ other) {
        // summary:
        //   Referential equality.

        return this.inherited(arguments) && this === other;
      },

      getValue: function() {
        return this._representation;
      },

      toJSON: function() {
        return this._representation;
      },

      toString: function() {
        return this._representation;
      }

    });

    function isEnumJson(EnumDef, json) {
      // summary:
      //   Is `json` the String representation of a value defined in EnumDef?

      return Object.keys(EnumDef).
        map(function(ed) {return EnumDef[ed]._representation;}).
        indexOf(json) >= 0;
    }

    function enumRevive(EnumDef, json) {
      // summary:
      //   Revive a json String value into the appropriate
      //   EnumDef value.
      // description:
      //   Returns undefined if no such value is found.
      //   *Note that `enum` is a reserved word.*
      //   https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words

      // pre: json is a String;
      // pre: isEnumJson(EnumDef, json);

      if (!json) {
        return undefined;
      }
      var match = Object.keys(EnumDef).filter(function(ed) {return EnumDef[ed]._representation === json;});
      if (match.length > 1) {
        throw "Error: there are different values in enum type " + EnumDef + " with the same value.";
      }
      if (match.length < 1) {
        return undefined;
      }
      return EnumDef[match[0]]; // return EnumerationValue
    }

    EnumerationValue.isJson = isEnumJson;
    EnumerationValue.revive = enumRevive;

    return EnumerationValue;
  }
);
