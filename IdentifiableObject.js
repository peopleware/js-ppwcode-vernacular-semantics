/*
 Copyright 2016 - $Date $ by PeopleWare n.v.

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

define(["dojo/_base/declare", "./PpwCodeObject", "ppwcode-util-oddsAndEnds/js", "module"],
  function(declare, PpwCodeObject, js, module) {

    var IdentifiableObject = declare([PpwCodeObject], {
      // summary:
      //   IdentifiableObjects are PpwCodeObjects that feature a method `getKey()`.

      _c_invar: [
        function() {return js.typeOf(this.getTypeDescription()) === "string";}
      ],

      getKey: function() {
        // summary:
        //   A (business) key (String) that uniquely identifies
        //   the object represented by this (if we all keep to the rules).
        // description:
        //   There is no default, but implementations are advised to return
        //   `this.getTypeDescription() + "@" + id`, where `id` is a String uniquely
        //   and durably identifying the instance within the type.
        //   If it is impossible to return a unique key (in border conditions),
        //   the function should return falsy.
        // tags
        //   protected extension

        this._c_ABSTRACT();
      }

    });

    IdentifiableObject.mid = module.id;

    return IdentifiableObject;
  }
);
