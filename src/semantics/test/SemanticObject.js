define(["dojo/main", "ppwcode/contracts/doh", "../SemanticObject"],
    function(dojo, doh, SemanticObject) {

      doh.register(SemanticObject.prototype.declaredClass, [

        function testConstructor1() {
          var subject = new SemanticObject({});

          doh.invars(subject);
          // post
        },

        function testConstructor2() {
          var subject = new SemanticObject();

          doh.invars(subject);
          // post
        },

        function testToJSON() {
          var subject = new SemanticObject();
          var result = subject.toJSON();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(result instanceof Object);

          console.log(result);
        },

        function testToString() {
          var subject = new SemanticObject();
          var result = subject.toString();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(typeof result === "string");
          doh.isNot("", result);

          console.log(result);
        }

        // TODO test set

      ]);

    }
);
