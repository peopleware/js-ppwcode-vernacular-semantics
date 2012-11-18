define(["dojo/main", "ppwcode_contracts/doh", "../SemanticObject"],
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

        function testReload1() {
          var subject = new SemanticObject();
          subject.reload();

          doh.invars(subject);
          // post
        },

        function testReload2() {
          var subject = new SemanticObject();
          subject.reload({});

          doh.invars(subject);
          // post
        },

        function testReload3() {
          var subject = new SemanticObject();
          subject.reload({huppeldepup: "happeldepap"});

          doh.invars(subject);
          // post
        },

        function testToJsonObject() {
          var subject = new SemanticObject();
          var result = subject.toJsonObject();

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

      ]);

    }
);
