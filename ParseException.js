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

define(["dojo/_base/declare", "ppwcode-vernacular-exceptions/SemanticException"],
  function(declare, SemanticException) {

    var ParseException = declare([SemanticException], {
      // summary:
      //   Thrown by a parse function to indicate that the supplied `str` could
      //   not be parsed into the demanded `targetType` given the supplied `options`.

      invars: [
      ],

      // targetType: Function
      targetType: null,

      // str: String?
      //   The string that we tried to parse.
      str: null,

      // options: Object
      //   The options used when we tried to parse `str`.
      options: null,

      constructor: function(kwargs) {
        if (kwargs) {
          this.targetType = kwargs.targetType;
          this.str = kwargs.str;
          this.options = kwargs.options;
        }
      },

      like: function(/*ParseException*/ other) {
        return this.inherited(arguments) &&
          this.targetType === other.targetType &&
          this.str === other.str &&
          this.options === other.options;
      }

      // TODO need JSON and toString?

    });

    return ParseException;
  }
);
