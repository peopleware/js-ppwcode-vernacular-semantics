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

define(["ppwcode-util-contracts/doh", "../SemanticObject"],
    function(doh, SemanticObject) {

      doh.register("ppwcode vernacular semantics SemanticObject", [

        function testConstructor1() {
          var subject = new SemanticObject({});

          doh.invars(subject);
          // post
        },

        function testConstructor2() {
          var subject = new SemanticObject();

          doh.invars(subject);
          // post
        },

        function testToJSON() {
          var subject = new SemanticObject();
          var result = subject.toJSON();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(result instanceof Object);

          console.log(result);
        },

        function testToString() {
          var subject = new SemanticObject();
          var result = subject.toString();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(typeof result === "string");
          doh.isNot("", result);

          console.log(result);
        }

        // TODO test set

      ]);

    }
);
