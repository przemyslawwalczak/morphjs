var Morph;
(function (Morph) {
    function test() {
        console.log('hello world');
    }
    Morph.test = test;
})(Morph || (Morph = {}));
