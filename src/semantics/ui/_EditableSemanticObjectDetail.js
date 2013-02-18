define(["dojo/_base/declare", "ppwcode/contracts/_Mixin", "dojo/_base/lang", "dijit/registry", "dojo/dom-style", "dojo/dom-class", "dojo/has",
        "dijit/_WidgetBase", "../SemanticObject",
        "ppwcode/contracts/doh"], // MUDO REMOVE temp for testing invariants in the field
    function(declare, _ContractMixin, lang, registry, domStyle, domClass, has,
             _WidgetBase, SemanticObject,
             doh) {

      var presentationModes = [
        // presentationMode and stylePresentationMode for viewing the data. No interaction allowed.
        "VIEW",

        // presentationMode and stylePresentationMode for editing the data. Interaction allowed.
        "EDIT",

        // presentationMode and stylePresentationMode while the SemanticObject is busy. No interaction allowed.
        "BUSY",

        // presentationMode and stylePresentationMode representing unacceptable data (the object is
        // not civilized, or we have other means of knowing the data is unacceptable).
        // Interaction must be allowed to reset the object, or ammeliorate the data/
        // This means this is a sub-state of EDIT.
        "WILD",

        // presentationMode and stylePresentationMode representing an error occured. We cannot proceed. The widget
        // and its object must be destroyed.
        "ERROR"];

      var stylePresentationModes = presentationModes.slice(0); // copy
      // stylePresentationMode for when there is no target
      stylePresentationModes.push("NOTARGET");

      function setStylepresentationModeOnWidgets(domNode, stylePresentationMode) {
        if (has("dojo-debug-messages")) {
          // make ERROR and WILD mode very clear in debug mode
          if (stylePresentationMode === _EditableSemanticObjectDetail.prototype.NOTARGET) {
            domStyle.set(domNode, "backgroundColor", "gray");
          }
          else if (stylePresentationMode === _EditableSemanticObjectDetail.prototype.ERROR) {
            domStyle.set(domNode, "backgroundColor", "red");
          }
          else if (stylePresentationMode === _EditableSemanticObjectDetail.prototype.WILD) {
            domStyle.set(domNode, "backgroundColor", "yellow");
          }
          else {
            domStyle.set(domNode, "backgroundColor", "");
          }
        }
        var innerWidgets = registry.findWidgets(domNode);
        var widgetState = null;
        switch (stylePresentationMode) {
          case _EditableSemanticObjectDetail.prototype.NOTARGET:
            widgetState = { readOnly:false, disabled:true };
            break;
          case _EditableSemanticObjectDetail.prototype.EDIT:
            widgetState = { readOnly:false, disabled:false };
            break;
          case _EditableSemanticObjectDetail.prototype.BUSY:
            widgetState = { readOnly:false, disabled:true };
            break;
          case _EditableSemanticObjectDetail.prototype.ERROR:
            widgetState = { readOnly:false, disabled:true };
            break;
          default:
            widgetState = { readOnly:true, disabled:false };
        }
        innerWidgets.forEach(function (w) {
          if (!w.isInstanceOf(_EditableSemanticObjectDetail)) {
            w.set("readOnly", widgetState.readOnly);
            w.set("disabled", widgetState.disabled);
          }
        });
      }

      function setStylePresentationModeOnBlock(domNode, presentationMode) {
        if (presentationMode === _EditableSemanticObjectDetail.prototype.VIEW ||
            presentationMode === _EditableSemanticObjectDetail.prototype.EDIT ||
            presentationMode === _EditableSemanticObjectDetail.prototype.WILD) {
          domClass.replace(domNode,
            "editableSemanticObjectDetail_blockEnabled",
            "editableSemanticObjectDetail_blockDisabled editableSemanticObjectDetail_blockInvisible"
          );
        }
        else if (presentationMode === _EditableSemanticObjectDetail.prototype.BUSY ||
                 presentationMode === _EditableSemanticObjectDetail.prototype.ERROR) {
          domClass.replace(domNode,
            "editableSemanticObjectDetail_blockDisabled",
            "editableSemanticObjectDetail_blockEnabled editableSemanticObjectDetail_blockInvisible"
          );
        }
        else { // no target
          domClass.replace(domNode,
            "editableSemanticObjectDetail_blockInvisible",
            "editableSemanticObjectDetail_blockEnabled editableSemanticObjectDetail_blockDisabled"
          );
        }
      }

      var _EditableSemanticObjectDetail = declare([_WidgetBase, _ContractMixin], {
        // summary:
        //   Widget that represents a SemanticObject in detail, and that gives the opportunity
        //   to the user the view the details, edit the details, and create a new object.
        //   Abstract class to be extended for particular subtypes of SemanticObject.
        // description:
        //   What is common to all subtypes is that the widget:
        //   - has a `target` that is a SemanticObject; getTargetType() returns the top-most supported
        //     Constructor of supported targets. All targets must be instances of this type.
        //   - has an `presentationMode` (view, edit, busy, wild, error)
        //   - has a `stylePresentationMode`
        //
        //   The representation should reflect the presentationMode in a clear visual way to the user.
        //   This is the `stylePresentationModel`. It is the `presentationMode` if `target !== null`,
        //   and `NOTARGET` otherwise.
        //   Even when the information shown is completely read-only, widgets should extend
        //   this class, to change the representation of the displayed information consistently
        //   with other information in different presentationModes, e.g., in "busy" mode.
        //   The available presentation modes are defined in _EditableSemanticObjectDetail.prototype.presentationModes.
        //
        //   Instances can be wrapped around zero or more _EditableSemanticObjectDetails, recursively (no loops!).
        //   We take care of propagating `presentationMode`. Subclasses need to override
        //   getWrappedDetails to return the wrapped details. All instances need to be instances of this class.
        //   The default implementation returns an empty array.
        //   The target of a wrapped detail might be the same target as our target, but it might be
        //   another related object, of a different type. set("target", ...) will call _propagateTarget, which is
        //   chained, so that subclasses can add propagation of setting the target. Our implementation only sets our
        //   target.

        _c_invar: [
          function() {return this.get("presentationMode");},
          function() {return this.presentationModes.indexOf(this.get("presentationMode")) >= 0;},
          function() {return this.getTargetType() != null;},
          // TODO getTargetType is a subtype of SemanticObject
          function() {return this.get("target") == null ||
                        (this.get("target").isInstanceOf && this.get("target").isInstanceOf(this.getTargetType()));},
          function() {return this.get("stylePresentationMode");},
          function() {return this.stylePresentationModes.indexOf(this.get("stylePresentationMode")) >= 0;},
          function() {return (this.get("stylePresentationMode") === this.NOTARGET) === (this.get("target") === null);},
          function() {return this.get("target") !== null ? this.get("stylePresentationMode") === this.get("presentationMode") : true;},
          function() {return this._wrappedDetails() != null;},
          function() {return lang.isArray(this._wrappedDetails());},
          {
            objectSelector: function() {
              return this._wrappedDetails();
            },
            invars: [
              function(wd) {
                return wd && wd != null &&
                  wd.isInstanceOf && wd.isInstanceOf(_EditableSemanticObjectDetail);
              },
              // wrapped details might contain other objects of other types as target,
              // or null, but the presentationMode needs to be in sync. The stylePresentationMode
              // can differ.
              function(wd) {
                return wd.get("presentationMode") === this.get("presentationMode");
              }
            ]
          }
        ],

        "-chains-": {
          _propagateTarget: "after",
          _localPresentationModeChange: "after"
        },

        // target: SemanticObject
        //    SemanticObject that is represented.
        //    Access in declarative template with  ... data-dojo-props="value: at('rel:', BINDING_PROPERTY_NAME)
        target: null,

        // presentationMode: String
        //    The presentation mode is either view, edit, busy, wild, or error
        presentationMode: stylePresentationModes[0], // default value

        // stylePresentationMode: String
        //    The stylePresentationMode is the same as the presentationMode, except when there is no target.
        //    Then it is NOTARGET.
        _getStylePresentationModeAttr: function() {
          return this.target ? this.get("presentationMode") : this.NOTARGET;
        },

        isInEditMode: function() {
          // summary:
          //    This is in a `stylePresentationMode` that allows the user to change the values, if there is a target and
          //    it is editable.
          return this.presentationMode === this.EDIT || this.presentationMode === this.BUSY || this.presentationMode === this.WILD;
        },

        _wrappedDetails: function() {
          // summary:
          //   Array containing the wrapped details, a subclass wants the target and presentationMode propagated to.
          // tags:
          //   protected

          return []; // return Array
        },

        getTargetType: function() {
          // summary:
          //    The supported type of SemanticObjects. All targets must be an instance of this type.
          // description:
          //    Subclasses should overwrite to return the correct type.

          return SemanticObject;
        },

        _propagateTarget: function(/*SemanticObject*/ so) {
          // summary:
          //   Propagate the target as appropriate to wrapped details.
          //   Chained. Subtypes could add propagation to wrapped details.
          // tags:
          //   protected
          // description:
          //   Does nothing in _EditableSemanticObjectDetail

          this._c_NOP();
        },

        _setTargetAttr: function(so) {
          // summary:
          //    Sets the target of this instance. Chained. Subtypes could add propagation to wrapped details.
          this._c_pre(function() {return so == null || (so.isInstanceOf && so.isInstanceOf(this.getTargetType()));});

          if (so !== this.get("target")) {
            this._set("target", so);
          }
          this._propagateTarget(so);
          this.set("presentationMode", this.VIEW);

          doh.validateInvariants(this); // MUDO REMOVE
        },

        _setPresentationModeAttr: function(value) {
          // summary:
          //    Set the presentationMode, and propagate to the wrapped details.
          //    Also makes all innerWidgets read-only in presentationMode VIEW,
          //    disabled in presentationMode BUSY, and not-read-only and enabled
          //    in the other presentationModes.

          // Called during create by _WidgetBase with default value automatically
          this._c_pre(function() {return value != null});
          this._c_pre(function() {return _EditableSemanticObjectDetail.prototype.presentationModes.indexOf(value) >= 0});

          this._set("presentationMode", value);
          this._wrappedDetails().forEach(function(wd) {
            wd.set("presentationMode", value);
          });
          var myDomNode = this.get("domNode");
          var stylePresentationMode = this.get("stylePresentationMode");
          setStylePresentationModeOnBlock(myDomNode, stylePresentationMode);
          setStylepresentationModeOnWidgets(myDomNode, stylePresentationMode);
          this._localPresentationModeChange(value);
          doh.validateInvariants(this); // MUDO REMOVE
        },

        _localPresentationModeChange: function(/*String*/ presentationMode) {
          // summary:
          //   Make changes to representation to represent the
          //   new edit mode. Chained. Overwrite when needed.
          // tags:
          //   protected
          // description:
          //   Does nothing in _EditableSemanticObjectDetail

          this._c_NOP();
        }

      });

      // All supported presentationModes
      _EditableSemanticObjectDetail.prototype.presentationModes = presentationModes;
      // All supported stylePresentationModes
      _EditableSemanticObjectDetail.prototype.stylePresentationModes = stylePresentationModes;
      stylePresentationModes.forEach(function(em) {
        _EditableSemanticObjectDetail.prototype[em] = em;
      });

      return _EditableSemanticObjectDetail; // return _EditableSemanticObjectDetail

    });
