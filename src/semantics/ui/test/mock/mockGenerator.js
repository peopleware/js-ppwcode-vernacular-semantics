define(["dojo/_base/declare"],
    function (declare) {

      /* Note: sadly we can not do this with the widgets.
         The reason is caching of the templates.
       */

      function nonEmptyStringOrNull(s) {
        return (s && s !== "") ? s : null;
      }

      var personClass = function(BaseType) {
        // summary:
        //   Generates a class for a Person, that inherits from BaseType.

        return declare([BaseType], {

          _c_invar:[
            function() {return this._c_prop_string("name")},
            function() {return this._c_prop_string("street")},
            function() {return this._c_prop_string("zip")},
            function() {return this._c_prop_string("city")},
            function() {return this._c_prop_string("tel")}
          ],

          constructor:function (/*Object*/ props) {
            this._c_pre(function() {return !props});
            // TODO this should be removed when the superclass does it for us
          },

          name: null,
          street: null,
          zip: null,
          city:null,
          tel: null,

          wildExceptions: function() {
            var cpe = [];// MUDO CompoundPropertyException
            if (! this.get("name") || this.get("name") === "") {
              cpe.push({source: this, propertyName: "name", message: "MANDATORY"});
            }
            return cpe;
          },

          reload: function(json) {
            this._c_pre(function() { return (json !== null); });
            this._c_pre(function() {return json.name && json.name !== null && json.name !== ""});

            this.set("name", json.name);
            this.set("street", nonEmptyStringOrNull(json.street));
            this.set("zip", nonEmptyStringOrNull(json.zip));
            this.set("city", nonEmptyStringOrNull(json.city));
            this.set("tel", nonEmptyStringOrNull(json.tel));
          },

          _extendJsonObject:function (/*Object*/ json) {
            json.name = this.name;
            json.street = this.street;
            json.zip = this.zip;
            json.city = this.city;
            json.tel = this.tel;
          },

          _stateToString:function (/*Array of String*/ toStrings) {
            toStrings.push("name: " + this.name);
            toStrings.push("street: " + this.street);
            toStrings.push("zip: " + this.zip);
            toStrings.push("city: " + this.city);
            toStrings.push("tel: " + this.tel);
          }

        });
      };

      var specialPersonClass = function(Person) {
        // summary:
        //   Generates a class for a SpecialPerson, that inherits from Person.

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

      };

      var generator = {
        personClass: personClass,
        specialPersonClass: specialPersonClass
      };

      return generator;
    }
);
