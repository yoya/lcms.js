# lcms.js

JavaScript Little-CMS powered by emscripten

# usage

```html
<script type="text/javascript" src="lcms-wrapper.js"> </script>
<script type="text/javascript" src="bin/lcms.js"> </script>

<script>
var profile = cmsCreate_sRGBProfile();
var text = cmsGetProfileInfoASCII(profile,
                                  cmsInfoDescription, "en", "US");
var rXYZ = cmsReadTag_XYZ(profile, cmsSigRedColorantTag);
var rxyY = cmsXYZ2xyY(rXYZ);

console.log(text);
console.log(rXYZ, rxyY);
</script>
```

# usage (WebAssembly)

The same wrapper works with the WebAssembly build.
The runtime is initialized asynchronously, so wait for onRuntimeInitialized.
bin/lcms-wasm.wasm is fetched from the same directory as bin/lcms-wasm.js,
this needs an HTTP server (file:// does not work).

```html
<script>
var Module = {
    onRuntimeInitialized: function() {
        var profile = cmsCreate_sRGBProfile();
        var text = cmsGetProfileInfoASCII(profile,
                                          cmsInfoDescription, "en", "US");
        console.log(text);
    }
};
</script>
<script type="text/javascript" src="lcms-wrapper.js"> </script>
<script type="text/javascript" src="bin/lcms-wasm.js"> </script>
```

# build

```
git submodule update --init
./build.sh       # bin/lcms.js, bin/lcms-O1.js, bin/lcms-all.js
./build-wasm.sh  # bin/lcms-wasm.js, bin/lcms-wasm.wasm
```

- All the files in bin/ are built from the mm2/Little-CMS submodule with emcc 6.0.13.
- bin/lcms.js is a JavaScript (wasm2js) build, it is initialized synchronously.
  emcc warns that this output (-s WASM=0) is deprecated.
- bin/lcms-O1.js is the same as bin/lcms.js but built with -O1.
- bin/lcms-all.js exports all the functions of Little-CMS.

# demo

- test-wasm.html (WebAssembly, print to developer console)

- test.html (print to developer console)
- http://app.awm.jp/image.js/lcms.html
  - https://github.com/yoya/image.js / lcms.html,lcms.js
