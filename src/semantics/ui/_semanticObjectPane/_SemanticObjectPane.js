define(["dojo/_base/declare", "ppwcode/contracts/_Mixin", "dojo/_base/lang", "dijit/registry", "dojo/dom-style", "dojo/dom-class", "dojo/has",
        "dijit/_WidgetBase", "../../SemanticObject",
        "dijit/form/ValidationTextBox", "dojox/mvc/Output", "dojox/form/CheckedMultiSelect", "dijit/form/SimpleTextArea",
         "dijit/form/CheckBox",
         "xstyle/css!./_SemanticObjectPane.css"],
    function(declare, _ContractMixin, lang, registry, domStyle, domClass, has,
             _WidgetBase, SemanticObject,
             ValidationTextBox, Output, CheckedMultiSelect, SimpleTextArea,
             CheckBox) {

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

      function setStylepresentationMode(sop, stylePresentationMode) {
        var domNode = sop.get("domNode");
        var innerWidgets = registry.findWidgets(domNode);
        var widgetState = null;
        switch (stylePresentationMode) {
          case _SemanticObjectPane.prototype.NOTARGET:
            widgetState = { readOnly:false, disabled:true };
            break;
          case _SemanticObjectPane.prototype.EDIT:
          case _SemanticObjectPane.prototype.WILD:
            widgetState = { readOnly:false, disabled:false };
            break;
          case _SemanticObjectPane.prototype.BUSY:
          case _SemanticObjectPane.prototype.ERROR:
            widgetState = { readOnly:false, disabled:true };
            break;
          default: // VIEW
            widgetState = { readOnly:true, disabled:false };
        }
        innerWidgets.forEach(function (w) {
          if (w.isInstanceOf(ValidationTextBox) || w.isInstanceOf(Output)
              || w.isInstanceOf(CheckedMultiSelect) || w.isInstanceOf(SimpleTextArea) || w.isInstanceOf(CheckBox)) {
            w.set("readOnly", widgetState.readOnly);
            w.set("disabled", widgetState.disabled);
          }
        });
        if (stylePresentationMode == _SemanticObjectPane.prototype.VIEW ||
            stylePresentationMode == _SemanticObjectPane.prototype.EDIT) {
          domClass.replace(domNode,
            "SemanticObjectPane_enabled",
            "SemanticObjectPane_busy SemanticObjectPane_wild SemanticObjectPane_disabled SemanticObjectPane_error SemanticObjectPane_notarget");
        }
        else if (stylePresentationMode == _SemanticObjectPane.prototype.BUSY) {
          domClass.replace(domNode,
            "SemanticObjectPane_busy",
            "SemanticObjectPane_enabled SemanticObjectPane_wild SemanticObjectPane_disabled SemanticObjectPane_error SemanticObjectPane_notarget");
        }
        else if (stylePresentationMode == _SemanticObjectPane.prototype.WILD) {
          domClass.replace(domNode,
            "SemanticObjectPane_wild",
            "SemanticObjectPane_enabled SemanticObjectPane_busy SemanticObjectPane_disabled SemanticObjectPane_error SemanticObjectPane_notarget");
        }
        else if (stylePresentationMode == _SemanticObjectPane.prototype.ERROR) {
          domClass.replace(domNode,
            "SemanticObjectPane_error",
            "SemanticObjectPane_enabled SemanticObjectPane_busy SemanticObjectPane_wild SemanticObjectPane_disabled SemanticObjectPane_notarget");
        }
        else { // NOTARGET
          domClass.replace(domNode,
            " SemanticObjectPane_notarget",
            "SemanticObjectPane_enabled SemanticObjectPane_busy SemanticObjectPane_wild SemanticObjectPane_error SemanticObjectPane_disabled");
        }
      }

      var _SemanticObjectPane = declare([_WidgetBase, _ContractMixin], {
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
        //   The available presentation modes are defined in _SemanticObjectPane.prototype.presentationModes.
        //
        //   Instances can be wrapped around zero or more _SemanticObjectPanes, recursively (no loops!).
        //   We take care of propagating `presentationMode`. Subclasses need to override
        //   getWrappedDetails to return the wrapped details. All instances need to be instances of this class.
        //   The default implementation returns an empty array.
        //   The target of a wrapped detail might be the same target as our target, but it might be
        //   another related object, of a different type. set("target", ...) will call _propagateTarget, which is
        //   chained, so that subclasses can add propagation of setting the target. Our implementation only sets our
        //   target.
        //
        //   This class is concerned with presentation. Other classes might add presentation
        //   and functionality to support interaction with the user (save and cancel buttons, etc. -
        //   see e.g. ppwcode persistence).

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
                  wd.isInstanceOf && wd.isInstanceOf(_SemanticObjectPane);
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
          _propagateOpener: "after",
          _localPresentationModeChange: "after"
        },

        // target: SemanticObject
        //    SemanticObject that is represented.
        //    Access in declarative template with  ... data-dojo-props="value: at('rel:', BINDING_PROPERTY_NAME)
        target: null,

        // presentationMode: String
        //    The presentation mode is either view, edit, busy, wild, or error
        presentationMode: stylePresentationModes[0], // default value

        // opener: Function
        //   Function that attempts to open a new "window" or "pane" for another PersistentObject
        //   (which is mostly linked to the current one)
        opener: null,

        widgetSize: 0,

        postCreate: function() {
          this.inherited(arguments);
          domClass.add(this.get("domNode"), "SemanticObjectPane");
        },

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
          return this.target &&
            (this.presentationMode === this.EDIT || this.presentationMode === this.BUSY || this.presentationMode === this.WILD);
        },

        _wrappedDetails: function() {
          // summary:
          //   Array containing the wrapped details, a subclass wants the presentationMode propagated to.
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
          //   Does nothing in _SemanticObjectPane.

          this._c_NOP(so);
        },

        _setTargetAttr: function(so) {
          // summary:
          //    Sets the target of this instance. Chained. Subtypes could add propagation to wrapped details.
          this._c_pre(function() {return so == null || (so.isInstanceOf && so.isInstanceOf(this.getTargetType()));});

          if (so !== this.get("target")) {
            this._set("target", so);
          }
          this._propagateTarget(so);
          this.set("presentationMode", so !== null && so.persistenceId === null ? this.EDIT : this.VIEW);
        },

        _propagateOpener: function(/*Function*/ opener) {
          // summary:
          //   Propagate the opener function as appropriate to wrapped details.
          //   Chained. Subtypes could add propagation to wrapped details.
          // tags:
          //   protected
          // description:
          //   Does nothing in _SemanticObjectPane.

          this._c_NOP(opener);
        },

        _setOpenerAttr: function(opener) {
          if (opener !== this.get("opener")) {
            this._set("opener", opener);
          }
          this._propagateOpener(opener);
        },

        _setPresentationModeAttr: function(value) {
          // summary:
          //    Set the presentationMode, and propagate to the wrapped details.
          //    Also makes all innerWidgets read-only in presentationMode VIEW,
          //    disabled in presentationMode BUSY, and not-read-only and enabled
          //    in the other presentationModes.

          // Called during create by _WidgetBase with default value automatically
          this._c_pre(function() {return value != null});
          this._c_pre(function() {return _SemanticObjectPane.prototype.presentationModes.indexOf(value) >= 0});

          this._set("presentationMode", value);
          this._wrappedDetails().forEach(function(wd) {
            wd.set("presentationMode", value);
          });
          var myDomNode = this.get("domNode");
          var stylePresentationMode = this.get("stylePresentationMode");
          setStylepresentationMode(this, stylePresentationMode);
          this._localPresentationModeChange(value);
        },

        _localPresentationModeChange: function(/*String*/ presentationMode) {
          // summary:
          //   Make changes to representation to represent the
          //   new edit mode. Chained. Overwrite when needed.
          // tags:
          //   protected
          // description:
          //   Does nothing in _SemanticObjectPane

          this._c_NOP(presentationMode);
        },

        getWidgetSize: function() {
          return this.widgetSize;
        }

      });

      // All supported presentationModes
      _SemanticObjectPane.prototype.presentationModes = presentationModes;
      // All supported stylePresentationModes
      _SemanticObjectPane.prototype.stylePresentationModes = stylePresentationModes;
      stylePresentationModes.forEach(function(em) {
        _SemanticObjectPane.prototype[em] = em;
      });

      return _SemanticObjectPane; // return _SemanticObjectPane

    });
