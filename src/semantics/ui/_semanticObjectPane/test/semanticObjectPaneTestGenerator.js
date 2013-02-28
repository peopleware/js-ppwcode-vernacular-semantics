define(["dojo/main", "ppwcode/contracts/doh", "dojo/_base/lang", "require", "../_SemanticObjectPane"],
  function(dojo, doh) {

    var generator = function(/*_SemanticObjectPane*/ pane,
                             /*Function*/ TargetType,
                             /*Function*/ createTargetInstance,
                             /*String?*/ propertyName,
                             /*Object?*/ newPropertyValue,
                             /*String?*/ pathToPropertyField) {
      return [

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
          name: "change property on target",
          setUp: function() {
            this.targetInstance = createTargetInstance();
            pane.set("target", this.targetInstance);
          },
          runTest: function() {
            if (propertyName) {
              this.targetInstance.set(propertyName, newPropertyValue);
              doh.invars(pane);
              // doh.is(TargetType, pane.getTargetType());
              doh.is(pane.VIEW, pane.get("presentationMode"));
              doh.is(this.targetInstance, pane.get("target"));
              doh.is(pane.VIEW, pane.get("stylePresentationMode"));
              doh.f(pane.isInEditMode());
              if (pathToPropertyField) {
                var field = lang.getObject(pathToPropertyField, false, pane);
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
          this.targetInstance = createTargetInstance();
            pane.set("target", this.targetInstance);
          },
          runTest: function() {
            if (propertyName && pathToPropertyField) {
              var field = lang.getObject(pathToPropertyField, false, pane);
              field.set("value", newPropertyValue);
              doh.invars(pane);
              // doh.is(TargetType, pane.getTargetType());
              doh.is(pane.VIEW, pane.get("presentationMode"));
              doh.is(this.targetInstance, pane.get("target"));
              doh.is(pane.VIEW, pane.get("stylePresentationMode"));
              doh.f(pane.isInEditMode());
              doh.is(field.get("value"), this.targetInstance.get(propertyName));
            }
          },
          tearDown: function() {
            pane.set("target", null);
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
    };

    return generator;
  }
);
