define(["dojo/_base/declare", "ppwcode/oddsAndEnds/ui/_MultiLangOutput", "dojo/_base/lang"],
  function(declare, _MultiLangOutput, lang) {

    return declare([_MultiLangOutput], {
      // summary:
      //   This widget is a superclass for widgets that show (not-editable) the value of
      //   a Value in an i18n-ed way, and who can change the representation language.
      //   `lang` is the locale, which can change. `value` is the Value.
      //   Setting these re-renders.
      // description:
      //   Rendering is done using value.constructor.format. This means the formatter used is dynamic.
      //   The lang of this instance
      //   is injected as the locale in the options to that call, if no locale is set in formatOptions.

      "-chains-": {
        _extraFormatOption: "after"
      },

      // value: Value?
      value: null,
      // re-render on set is already done in superclass

      // formatOptions: Object
      //   Passed as options when formatting `value`.
      formatOptions: null,

      _extraFormatOption: function(/*Object*/ options) {
        // summary:
        //   Subclasses can enforce extra properties on the options object
        //   passed to this.value.constructor.format.
        //   Chained.

        // NOP
      },

      _output: function() {
        var outputNode = this.srcNodeRef || this.domNode;
        var result;
        if (!this.value) {
          result = this.get("missing");
        }
        else {
          var opt = this.formatOptions ? lang.clone(this.formatOptions) : {};
          opt.na = this.get("missing"); // overwrite
          if (!opt.locale) { // formatOptions have precedence
            opt.locale = this.findLang();
          }
          // default for escapeXml (where applicable) should be true; default is false in formatter
          // so, we need to set it to true, if it was not explicitly set to false in the formatOptions
          if (opt.escapeXml !== false) {
            opt.escapeXml = true;
          }
          this._extraFormatOption(opt);
          result = this.value.constructor.format(this.value, opt);
        }
        outputNode.innerHTML = result;
      }

    });
  }
);
