/*
 Copyright 2012 - $Date $ by PeopleWare n.v.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

define(["dojo/_base/declare", "ppwcode-util-contracts/_Mixin", "dojo/_base/kernel", "ppwcode-util-oddsAndEnds/js", "module"],
    function(declare, _ContractMixin, kernel, js, module) {

      var PpwCodeObject = declare([_ContractMixin], {

        _c_invar: [
          function() {return js.typeOf(this.getTypeDescription()) === "string";}
        ],

        "-chains-": {
          _extendJsonObject: "after",
          _stateToString: "after"
        },

        _extendJsonObject: function(/*Object*/ json) {
          // summary:
          //   Chained method that writes data to `json`.
          //   Called by toJSON.
          // description:
          //   Subclasses should overwrite this method
          //   to write the properties to `json` that are defined
          //   in that subclass.
          //   See also reload.
          // tags:
          //   protected extension

          this._c_NOP(json);
        },

        // TODO this framework for toJSON is not used by Enumeration; needs to be lower or mixed in

        toJSON: function() {
          // summary:
          //   Standard JavaScript function called by
          //   JSON.stringify when available.
          //   Calls this._extendJsonObject, which
          //   is chained. Subclasses should overwrite
          //   this method to control exactly what
          //   is serialized. By default, nothing is serialized
          //   and an empty object is returned.
          // description:
          //   See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON

          var json = {};
          this._extendJsonObject(json);
          return json; // return Object
        },

        toJsonObject: function() {
          // summary:
          //   Deprecated. Use toJSON instead. Will be removed soon.

          kernel.deprecated("ppwcode-vernacular-semantics/PpwCodeObject.toJsonObject.",
                            "Provide the object itself (using toJSON instead).",
                            "Before 1.0.");
          var json = {};
          this._extendJsonObject(json);
          return json; // return Object
        },

        // TODO this framework for toJSON is not used by Enumeration; needs to be lower or mixed in

        _stateToString: function(/*Array of String*/ toStrings) {
          // tags:
          //   protected extension

          this._c_NOP(toStrings);
        },

        getTypeDescription: function() {
          // summary:
          //   A string describing the type of this instance for toString.
          //   This is also used when sending data to the server.
          // description:
          //   The default is a property `mid` of the Constructor. If this
          //   does not exist, it is the declared class. Subtypes can override.
          // tags
          //   protected extension

          if (this.constructor.mid) {
            return this.constructor.mid;
          }
          else {
            return this.declaredClass;
          }
        },

        toString: function() {
          var toStrings = [];
          this._stateToString(toStrings);
          return this.getTypeDescription() + // return String
              " {" + toStrings.join(", ") + "}";
        }

      });

      PpwCodeObject.mid = module.id;

      return PpwCodeObject;
    }
);
