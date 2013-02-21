define(["dojo/_base/declare", "./Person"],
    function (declare, Person) {

      function nonEmptyStringOrNull(s) {
        return (s && s !== "") ? s : null;
      }

      return declare([Person], {

        _c_invar:[
          function() {return this._c_prop_string("email")}
        ],

        email: null,

        reload: function(json) {
          this._c_pre(function() { return (json !== null); });
          this._c_pre(function() {return json.name && json.name !== null && json.name !== ""});

          this.set("email", nonEmptyStringOrNull(json.email));
        },

        _extendJsonObject:function (/*Object*/ json) {
          json.email = this.email;
        },

        _stateToString:function (/*Array of String*/ toStrings) {
          toStrings.push("email: " + this.email);
        },

        isDeletable: function() {
          return false;
        }

      });
    }
);
