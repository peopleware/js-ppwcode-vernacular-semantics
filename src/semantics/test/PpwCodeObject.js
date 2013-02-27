define(["dojo/main", "ppwcode/contracts/doh", "../PpwCodeObject"],
    function(dojo, doh, PpwCodeObject) {

      doh.register("ppwcode vernacular semantics PpwCodeObject", [

        function testConstructor1() {
          var subject = new PpwCodeObject({});

          doh.invars(subject);
          // post
        },

        function testConstructor2() {
          var subject = new PpwCodeObject();

          doh.invars(subject);
          // post
        },

        function testReload1() {
          var subject = new PpwCodeObject();
          subject.reload();

          doh.invars(subject);
          // post
        },

        function testReload2() {
          var subject = new PpwCodeObject();
          subject.reload({});

          doh.invars(subject);
          // post
        },

        function testReload3() {
          var subject = new PpwCodeObject();
          subject.reload({huppeldepup: "happeldepap"});

          doh.invars(subject);
          // post
        },

        function testToJSON() {
          var subject = new PpwCodeObject();
          var result = subject.toJSON();

          doh.invars(subject);
          // post
          doh.isNot(null, result);
          doh.t(result instanceof Object);

          console.log(result);
        },

        function testToString() {
          var subject = new PpwCodeObject();
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
