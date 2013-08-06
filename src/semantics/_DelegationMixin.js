define(["dojo/_base/declare", "dojo/Stateful", "ppwcode/contracts/_Mixin", "ppwcode/oddsAndEnds/bindingChains", "module"],
    function(declare, Stateful, _ContractMixin, bindingChains, module) {

      // lang.getObject and lang.setObject don't use get and set
      function getProp(context, /*String[]*/ nameChain) {
        // nameChain:
        //   Note that this array will be changed by this method. On return, it will be empty.

        if (!nameChain || nameChain.length <= 0) {
          return context;
        }
        // there is more chain
        if (!context) {
          return undefined;
        }
        var first = nameChain.shift();
        var nextContext = context.get ? context.get(first) : context[first];
        return getProp(nextContext, nameChain);
      }

      var _DelegationMixing = declare([Stateful, _ContractMixin], {
        // summary:
        //   Mixin that adds the ability to create virtual properties that delegate to other properties.
        //   Only makes sense with Stateful.

        // IDEA created to save code that is ultimately not used; untested

        _c_invar: [
        ],

        postscript: function() {
          var self = this;

          function dependentPropertyChanged(dependentPropertyName) {
            return function(propName, previousValue, newValue) {
              if(self._watchCallbacks && newValue !== previousValue) {
                // fake the events
                self._watchCallbacks(dependentPropertyName, previousValue, newValue);
              }
            }
          }

          self.inherited(arguments);
          for (var delegatedPropertyName in self["-delegated-"]) {
            self["-delegated-"][delegatedPropertyName].fullNameChain = self["-delegated-"][delegatedPropertyName].path.split(".");
            self["-delegated-"][delegatedPropertyName].lastContextNameChain = self["-delegated-"][delegatedPropertyName].fullNameChain.slice(0);
            self["-delegated-"][delegatedPropertyName].lastName = self["-delegated-"][delegatedPropertyName].lastContextNameChain.pop();
            self["-delegated-"][delegatedPropertyName].changed = dependentPropertyChanged(delegatedPropertyName);
            self["-delegated-"][delegatedPropertyName].chain = bindingChains(
              self,
              [self["-delegated-"][delegatedPropertyName].path],
              self["-delegated-"][delegatedPropertyName].changed
            );
          }
        },

        get: function(/*String*/ propName) {
          // also get the delegated properties
          if (this["-delegated-"][propName]) {
            return getProp(this, this["-delegated-"][propName].nameChain);
          }
          return this.inherited(arguments);
        },

        set: function(/*String*/ propName, value) {
          // also get the delegated properties
          if (this["-delegated-"][propName]) {
            if (this["-delegated-"][propName].readOnly) {
              throw "ERROR: " + propName + " is read-only";
            }
            var lastContext = getProp(this, this["-delegated-"][propName].lastContextNameChain);
            if (!lastContext) {
              throw "ERROR: no context to set " + this["-delegated-"][propName].fullNameChain + " for " + propName;
            }
            if (lastContext.set) {
              return lastContext.set(this["-delegated-"][propName].lastName, value);
            }
            else {
              return lastContext[this["-delegated-"][propName].lastName] = value;
            }
          }
          return this.inherited(arguments);
        },

        "-delegated-": {
          something: {path: "one.two.three", readOnly: true} // MUDO change and document, take union over inheritance
        },

        _stateToString: function(/*Array of String*/ toStrings) {
          // tags:
          //   protected extension

          // MUDO; inherit from PpwCodeObject?
        }

      });

      _DelegationMixing.mid = module.id;

      return _DelegationMixing;
    }
);
