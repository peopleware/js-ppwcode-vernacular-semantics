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

define(["ppwcode-util-contracts/doh", "dojo/_base/lang",
        "../_SemanticObjectPane"],
  function(doh, lang) {

    var generator = function(/*_SemanticObjectPane*/ pane,
                             /*Function*/ TargetType,
                             /*Function*/ createTargetInstance,
                             /*String?*/ propertyName,
                             /*Object?*/ newPropertyValue,
                             /*String?*/ pathToPropertyField) {
      var tests = [

        // TODO doh.is(TargetType, pane.getTargetType()); fails
        /*
           In a debugger you can see easily that TargetType and pane.getTargetType() are 2 different instances
           of SemanticObject!
           The loader messes up!

           Needs investigation.
         */



        function testInitialState() {
          doh.invars(pane);
          // doh.is(TargetType, pane.getTargetType());
          doh.is(pane.VIEW, pane.get("presentationMode"));
          doh.is(null, pane.get("target"));
          doh.is(pane.NOTARGET, pane.get("stylePresentationMode"));
          doh.f(pane.isInEditMode());
        },

        {
          name: "set and remove target",
          setUp: function() {
            this.targetInstance = createTargetInstance();
          },
          runTest: function() {
            pane.set("target", this.targetInstance);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.VIEW, pane.get("presentationMode"));
            doh.is(this.targetInstance, pane.get("target"));
            doh.is(pane.VIEW, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
            pane.set("target", null);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.VIEW, pane.get("presentationMode"));
            doh.is(null, pane.get("target"));
            doh.is(pane.NOTARGET, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
          }
        },

        {
          name: "edit mode with a target",
          setUp: function() {
            this.targetInstance = createTargetInstance();
            pane.set("target", this.targetInstance);
            pane.set("presentationMode", pane.VIEW);
          },
          runTest: function() {
            pane.set("presentationMode", pane.EDIT);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.EDIT, pane.get("presentationMode"));
            doh.is(this.targetInstance, pane.get("target"));
            doh.is(pane.EDIT, pane.get("stylePresentationMode"));
            doh.t(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "busy mode with a target",
          setUp: function() {
            this.targetInstance = createTargetInstance();
            pane.set("target", this.targetInstance);
            pane.set("presentationMode", pane.EDIT);
          },
          runTest: function() {
            pane.set("presentationMode", pane.BUSY);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.BUSY, pane.get("presentationMode"));
            doh.is(this.targetInstance, pane.get("target"));
            doh.is(pane.BUSY, pane.get("stylePresentationMode"));
            doh.t(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "wild mode with a target",
          setUp: function() {
            this.targetInstance = createTargetInstance();
            pane.set("target", this.targetInstance);
            pane.set("presentationMode", pane.BUSY);
          },
          runTest: function() {
            pane.set("presentationMode", pane.WILD);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.WILD, pane.get("presentationMode"));
            doh.is(this.targetInstance, pane.get("target"));
            doh.is(pane.WILD, pane.get("stylePresentationMode"));
            doh.t(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "error mode with a target",
          setUp: function() {
            this.targetInstance = createTargetInstance();
            pane.set("target", this.targetInstance);
            pane.set("presentationMode", pane.BUSY);
          },
          runTest: function() {
            pane.set("presentationMode", pane.ERROR);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.ERROR, pane.get("presentationMode"));
            doh.is(this.targetInstance, pane.get("target"));
            doh.is(pane.ERROR, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "edit mode without a target",
          setUp: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          },
          runTest: function() {
            pane.set("presentationMode", pane.EDIT);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.EDIT, pane.get("presentationMode"));
            doh.is(null, pane.get("target"));
            doh.is(pane.NOTARGET, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "busy mode without a target",
          setUp: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.EDIT);
          },
          runTest: function() {
            pane.set("presentationMode", pane.BUSY);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.BUSY, pane.get("presentationMode"));
            doh.is(null, pane.get("target"));
            doh.is(pane.NOTARGET, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "wild mode without a target",
          setUp: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.BUSY);
          },
          runTest: function() {
            pane.set("presentationMode", pane.WILD);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.WILD, pane.get("presentationMode"));
            doh.is(null, pane.get("target"));
            doh.is(pane.NOTARGET, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        },

        {
          name: "error mode without a target",
          setUp: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.BUSY);
          },
          runTest: function() {
            pane.set("presentationMode", pane.ERROR);
            doh.invars(pane);
            // doh.is(TargetType, pane.getTargetType());
            doh.is(pane.ERROR, pane.get("presentationMode"));
            doh.is(null, pane.get("target"));
            doh.is(pane.NOTARGET, pane.get("stylePresentationMode"));
            doh.f(pane.isInEditMode());
          },
          tearDown: function() {
            pane.set("target", null);
            pane.set("presentationMode", pane.VIEW);
          }
        }
      ];

      if (propertyName && (newPropertyValue !== undefined) && pathToPropertyField) {

        tests = tests.concat([
          {
            name: "change property on target",
            setUp: function() {
              //noinspection JSPotentiallyInvalidUsageOfThis
              this.targetInstance = createTargetInstance();
              //noinspection JSPotentiallyInvalidUsageOfThis
              pane.set("target", this.targetInstance);
            },
            runTest: function() {
              if (propertyName) {
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.targetInstance.set(propertyName, newPropertyValue);
                doh.invars(pane);
                // doh.is(TargetType, pane.getTargetType());
                doh.is(pane.VIEW, pane.get("presentationMode"));
                //noinspection JSPotentiallyInvalidUsageOfThis
                doh.is(this.targetInstance, pane.get("target"));
                doh.is(pane.VIEW, pane.get("stylePresentationMode"));
                doh.f(pane.isInEditMode());
                if (pathToPropertyField) {
                  var field = lang.getObject(pathToPropertyField, false, pane);
                  //noinspection JSPotentiallyInvalidUsageOfThis
                  doh.is(this.targetInstance.get(propertyName), field.get("value"));
                }
              }
            },
            tearDown: function() {
              pane.set("target", null);
            }
          },

          {
            name: "change property on widget",
            setUp: function() {
            //noinspection JSPotentiallyInvalidUsageOfThis
            this.targetInstance = createTargetInstance();
              //noinspection JSPotentiallyInvalidUsageOfThis
              pane.set("target", this.targetInstance);
            },
            runTest: function() {
              if (propertyName && pathToPropertyField) {
                var field = lang.getObject(pathToPropertyField, false, pane);
                field.set("value", newPropertyValue);
                doh.invars(pane);
                // doh.is(TargetType, pane.getTargetType());
                doh.is(pane.VIEW, pane.get("presentationMode"));
                //noinspection JSPotentiallyInvalidUsageOfThis
                doh.is(this.targetInstance, pane.get("target"));
                doh.is(pane.VIEW, pane.get("stylePresentationMode"));
                doh.f(pane.isInEditMode());
                //noinspection JSPotentiallyInvalidUsageOfThis
                doh.is(field.get("value"), this.targetInstance.get(propertyName));
              }
            },
            tearDown: function() {
              pane.set("target", null);
            }
          }
        ]);

      }

      return tests;
    };

    return generator;
  }
);
