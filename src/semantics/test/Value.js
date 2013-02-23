define(["dojo/main", "ppwcode/contracts/doh", "../Value"],
    function(dojo, doh, Value) {

      doh.register(Value.prototype.declaredClass, [

        function testConstructor() {
          var subject = new Value({});

          doh.invars(subject);
          // post
        },

        function testToJSON() {
          var subject = new Value({});
          var result = subject.toJSON();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(result instanceof Object);

          console.log(result);
        },

        function testToString() {
          var subject = new Value({});
          var result = subject.toString();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(typeof result === "string");
          doh.isNot("", result);

          console.log(result);
        }

      ]);

    }
);
