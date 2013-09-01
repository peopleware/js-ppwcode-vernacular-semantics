define(["ppwcode.contracts/doh",
        "../Value",
        "dojo/_base/declare", "ppwcode.oddsAndEnds/js"],
    function(doh,
             Value,
             declare, js) {

      var ValueMock = declare([Value], {

        internalValue: null,

        constructor: function(/*Object*/ props) {
          this._c_pre(function() {return props /* exists and not null */;});
          this._c_pre(function() {return js.typeOf(props) === "object";});

          this.internalValue = props.internalValue;
        },

        compare: function(/*Value*/ other) {
          this._c_pre(function() {return !other || (other.isInstanceOf && other.isInstanceOf(this.constructor));});

          if (!other || this.internalValue > other.internalValue) {
            return +1;
          }
          if (this.equals(other)) {
            return 0;
          }
          return -1;
        },

        equals: function(/*Value*/ other) {
          return this.inherited(arguments) && (this.internalValue === other.internalValue);
        },

        getValue: function() {
          return this.internalValue; // return object
        },

        _extendJsonObject: function(/*Object*/ json) {
          json.internalValue = this.internalValue;
        },

        _stateToString: function(/*Array of String*/ toStrings) {
          toStrings.push("internalValue: " + this.internalValue);
        }

      });

      ValueMock.persistenceType = Value.persistenceType;

      function subjectValue(subject, propertyName, renameds) {
        return renameds && renameds.hasOwnProperty(propertyName) ? subject[renameds[propertyName]] : subject[propertyName];
      }

      function testGeneratorValue(Constructor, kwargs1, kwargs2, renameds) {
        // renameds: Object
        //  Mapping of json names to property names, for those names that have a different name in the subject
        //  than in the json

        if (!Constructor) {
          throw "CANNOT CREATE TESTS: no value type constructor.";
        }
        if (!Constructor.persistenceType) {
          throw "CANNOT CREATE TESTS: value type constructor has no persistenceType"
        }
        doh.register(Constructor.persistenceType, [

          function testConstructor() {
            var subject = new Constructor(kwargs1);

            doh.invars(subject);
            // post
            for (var pName in kwargs1) {
              doh.is(kwargs1[pName], subjectValue(subject, pName, renameds));
            }
          },

          {
            name: "test equals() 1",
            setUp: function() {
              this.subject = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject.equals(null);

              doh.invars(this.subject);
              // post
              doh.is("boolean", js.typeOf(result));
              doh.f(result);
            },
            tearDown: function() {
              delete this.subject;
            }
          },

          {
            name: "test equals() 2",
            setUp: function() {
              this.subject = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject.equals(this.subject);

              doh.invars(this.subject);
              // post
              doh.is("boolean", js.typeOf(result));
              doh.t(result);
            },
            tearDown: function() {
              delete this.subject;
            }
          },

          {
            name: "test equals() 3",
            setUp: function() {
              this.subject1 = new Constructor(kwargs1);
              this.subject2 = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject1.equals(this.subject2);

              doh.invars(this.subject1);
              doh.invars(this.subject2);
              // post
              doh.is("boolean", js.typeOf(result));
              doh.t(result);
            },
            tearDown: function() {
              delete this.subject1;
              delete this.subject2;
            }
          },

          {
            name: "test equals() 4a",
            setUp: function() {
              this.subject1 = new Constructor(kwargs1);
              this.subject2 = new Constructor(kwargs2);
            },
            runTest: function() {
              var result = this.subject1.equals(this.subject2);

              doh.invars(this.subject1);
              doh.invars(this.subject2);
              // post
              doh.is("boolean", js.typeOf(result));
              doh.f(result);
            },
            tearDown: function() {
              delete this.subject1;
              delete this.subject2;
            }
          },

          {
            name: "test equals() 4b",
            setUp: function() {
              this.subject1 = new Constructor(kwargs2);
              this.subject2 = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject1.equals(this.subject2);

              doh.invars(this.subject1);
              doh.invars(this.subject2);
              // post
              doh.is("boolean", js.typeOf(result));
              doh.f(result);
            },
            tearDown: function() {
              delete this.subject1;
              delete this.subject2;
            }
          },

          {
            name: "test compare() 1a",
            setUp: function() {
              this.subject1 = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject1.compare(null);

              doh.invars(this.subject1);
              // post
              doh.is("number", js.typeOf(result));
              doh.t(result > 0);
            },
            tearDown: function() {
              delete this.subject1;
            }
          },

          {
            name: "test compare() 1b",
            setUp: function() {
              this.subject1 = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject1.compare();

              doh.invars(this.subject1);
              // post
              doh.is("number", js.typeOf(result));
              doh.t(result > 0);
            },
            tearDown: function() {
              delete this.subject1;
            }
          },

          {
            name: "test compare() 2",
            setUp: function() {
              this.subject1 = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject1.compare(this.subject1);

              doh.invars(this.subject1);
              // post
              doh.is("number", js.typeOf(result));
              doh.t(result === 0);
            },
            tearDown: function() {
              delete this.subject1;
            }
          },

          {
            name: "test compare() 3",
            setUp: function() {
              this.subject1 = new Constructor(kwargs1);
              this.subject2 = new Constructor(kwargs2);
            },
            runTest: function() {
              var result = this.subject1.compare(this.subject2);

              doh.invars(this.subject1);
              doh.invars(this.subject2);
              // post
              doh.is("number", js.typeOf(result));
              doh.t(result < 0);
            },
            tearDown: function() {
              delete this.subject1;
              delete this.subject2;
            }
          },

          {
            name: "test getValue",
            setUp: function() {
              this.subject = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject.getValue();

              doh.invars(this.subject);
              // post
              doh.is("string", js.typeOf(result));
              doh.isNot("", result);
              console.log(result);
            },
            tearDown: function() {
              delete this.subject;
            }
          },

          {
            name: "test toJSON",
            setUp: function() {
              this.subject = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject.toJSON();

              doh.invars(this.subject);
              // post
              doh.is("object", js.typeOf(result));
              for (var pName in kwargs1) {
                doh.is(kwargs1[pName], result[pName]);
              }
            },
            tearDown: function() {
              delete this.subject;
            }
          },

          {
            name: "test toString",
            setUp: function() {
              this.subject = new Constructor(kwargs1);
            },
            runTest: function() {
              var result = this.subject.toString();

              doh.invars(this.subject);
              // post
              doh.is("string", js.typeOf(result));
              doh.isNot("", result);
              console.log(result);
            },
            tearDown: function() {
              delete this.subject;
            }
          }

        ])
      }

      testGeneratorValue(
        ValueMock,
        {
          internalValue: "INTERNAL VALUE"
        },
        {
          internalValue: 7
        }
      );

      testGeneratorValue.subjectValue = subjectValue;

      return testGeneratorValue;
    }
);
