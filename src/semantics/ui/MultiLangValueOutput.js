define(["dojo/_base/declare", "ppwcode/oddsAndEnds/ui/_MultiLangOutput",
        "ppwcode/oddsAndEnds/ui/_MultiLangParent", "dojo/_base/lang", "dojo/_base/kernel"],
  function(declare, _MultiLangOutput,
           _MultiLangParent, lang, kernel) {

    return declare([_MultiLangOutput], {
      // summary:
      //   This widget is a superclass for widgets that show (not-editable) the value of
      //   a Value in an i18n-ed way, and who can change the representation language.
      //   `lang` is the locale, which can change. `value` is the Value.
      //   Setting these re-renders.
      // description:
      //   If `lang` does not have a meaningful value, we look upwards in the widget
      //   tree for a value _MultiLangParent, and use its value.
      //   Missing values are rendered as `missing`.
      //
      //   If bindLang is true (the default), we bind lang on startup to the lang of a _MultiLangParent,
      //   if there is one.
      //
      //   All locales must be defined as extraLocale in dojoConfig.
      //
      //   Rendering is done using value.constructor.format. The lang of this instance
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
          result = (this.missing || this.missing === "") ? this.missing : 'N/A';
        }
        else {
          var opt = this.formatOptions ? lang.clone(this.formatOptions) : {};
          opt.na = this.missing;
          if (!opt.locale) {
            opt.locale = this._lookUpInWidgetHierarchy("lang", _MultiLangParent) || kernel.locale;
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
