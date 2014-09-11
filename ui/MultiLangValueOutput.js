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

define(["dojo/_base/declare", "ppwcode-util-oddsAndEnds/ui/MultiLangFormatOutput"],
  function(declare, MultiLangFormatOutput) {

    return declare([MultiLangFormatOutput], {
      // summary:
      //   This widget is a superclass for widgets that show (not-editable) the value of
      //   a Value in an i18n-ed way, and who can change the representation language.
      //   `lang` is the locale, which can change. `value` is the Value.
      //   Setting these re-renders.
      // description:
      //   Rendering is done using value.constructor.format. This means the formatter used is dynamic.
      //   The lang of this instance
      //   is injected as the locale in the options to that call, if no locale is set in formatOptions.

      // value: Value
      value: null,

      format: function(/*Value*/ value, /*Object*/ options) {
        return value.constructor.format(value, options)
      }

    });
  }
);
