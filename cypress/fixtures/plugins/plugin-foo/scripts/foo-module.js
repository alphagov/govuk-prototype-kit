import fooSubmodule from './foo-submodule.js';
const fooParagraph = document.getElementById('foo-module');
if (fooParagraph) {
    fooParagraph.hidden = false;
    setTimeout(() => {
        fooParagraph.innerHTML = 'The foo result is: ' + fooSubmodule(1, 2);
    }, 500);
}
