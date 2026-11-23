# lcms.js

[Little-CMS](https://www.littlecms.com/) (lcms2) for JavaScript, compiled with emscripten.

- A JavaScript build and a WebAssembly build, both from the same Little-CMS source.
- lcms-wrapper.js gives the lcms2 C API as plain JavaScript functions and
  constants with the same names (cmsCreateTransform, TYPE_RGB_8, ...).
- No dependencies, no bundler. Load two script files.

# files

| file | description |
|---|---|
| lcms-wrapper.js | the API wrapper, shared by all the builds |
| bin/lcms.js | JavaScript build (-O2), initialized synchronously |
| bin/lcms-O1.js | the same as bin/lcms.js, built with -O1 |
| bin/lcms-all.js | JavaScript build that exports all the functions of Little-CMS |
| bin/lcms-wasm.js, bin/lcms-wasm.wasm | WebAssembly build, initialized asynchronously |
| export.txt | the C functions exported to the wrapper |
| build.sh, build-wasm.sh | build scripts |
| mm2/Little-CMS | Little-CMS source (git submodule) |

The WebAssembly build is smaller and faster.
The JavaScript build can be used right after the script is loaded.

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

# color transform

```js
var hInput  = cmsCreate_sRGBProfile();
var hOutput = cmsCreateLab4Profile(null); // white point: D50
var transform = cmsCreateTransform(hInput, TYPE_RGB_8, hOutput, TYPE_Lab_DBL,
                                   INTENT_PERCEPTUAL, cmsFLAGS_NOCACHE);
var rgb = [255, 0, 0,  0, 255, 0]; // 2 pixels
var lab = cmsDoTransform(transform, rgb, 2); // Float64Array(6)

cmsDeleteTransform(transform);
cmsCloseProfile(hInput);
cmsCloseProfile(hOutput);
```

An ICC profile file is opened with cmsOpenProfileFromMem.

```js
var arr = new Uint8Array(arrayBuffer); // the contents of an .icc file
var hProfile = cmsOpenProfileFromMem(arr, arr.length);
```

# API

The functions and the constants are global, and follow lcms2.h.
See the [Little-CMS documentation](https://www.littlecms.com/) for their meanings,
and lcms-wrapper.js for the full list.

- profile: cmsOpenProfileFromMem, cmsCloseProfile, cmsCreate_sRGBProfile,
  cmsCreateXYZProfile, cmsCreateLab4Profile, cmsCreate_OkLabProfile,
  cmsCreateDeviceLinkFromCubeFile
- profile information: cmsGetProfileInfoASCII, cmsGetProfileInfoUTF8,
  cmsGetColorSpace, cmsGetHeaderCMM, cmsChannelsOfColorSpace,
  cmsDetectRGBProfileGamma, cmsFormatterForColorspaceOfProfile
- tag: cmsReadTag, cmsReadTag_XYZ, cmsReadTag_cicp, cmsReadTag_MHC2,
  cmsGetTagCount, cmsGetTagSignature, cmsGetTagOffsetAndSize
- transform: cmsCreateTransform, cmsCreateProofingTransform, cmsDoTransform,
  cmsDeleteTransform, cmsGetTransformInputFormat, cmsGetTransformOutputFormat
- pipeline: cmsGetTransformPipeline, cmsGetTransformGamutCheckPipeline,
  cmsPipelineInputChannels, cmsPipelineOutputChannels, cmsPipelineStageCount,
  cmsPipelineGetPtrToFirstStage, cmsPipelineEvalFloat,
  cmsStageNext, cmsStageType, cmsGetStageContextID
- named color: cmsGetTransformInputColorants, cmsGetTransformOutputColorants,
  cmsNamedColorCount, cmsNamedColorInfo
- others: cmsXYZ2xyY, cmsGetToneCurveSegment, cmsMLUalloc, cmsMLUfree,
  cmsMLUsetUTF8, cmsMLUgetUTF8, cmsCreateContext, cmsDeleteContext

Differences from the C API:

- Profiles, transforms and the other handles are numbers (C pointers).
  They are not garbage collected, release them with cmsCloseProfile,
  cmsDeleteTransform, ...
- cmsDoTransform(transform, inputArr, size) returns a new array instead of
  writing to an output buffer. size is the number of pixels.
  The result is a Uint16Array for integer formats (8 bit samples are 0-255),
  a Float64Array for float and double formats, and null for formats that are
  not supported (half float).
- Structures are returned as arrays or objects.
  cmsReadTag_XYZ and cmsXYZ2xyY use a Float64Array(3).
- cmsReadTag_XYZ, cmsReadTag_cicp and cmsReadTag_MHC2 are not in the C API,
  they read a tag of that type. cmsReadTag returns a raw pointer.
- cmsCreateDeviceLinkFromCubeFile reads from the emscripten file system,
  write the file with Module.FS.writeFile first.
- Writing tags and saving profiles are not supported.

# build

Needs [emscripten](https://emscripten.org/) (emcc).

```
git submodule update --init
./build.sh       # bin/lcms.js, bin/lcms-O1.js, bin/lcms-all.js
./build-wasm.sh  # bin/lcms-wasm.js, bin/lcms-wasm.wasm
```

- All the files in bin/ are built from the mm2/Little-CMS submodule
  (master after lcms 2.20) with emcc 6.0.13.
- bin/lcms.js is a JavaScript (wasm2js) build.
  emcc warns that this output (-s WASM=0) is deprecated.
- To call another function of Little-CMS, add its name to export.txt,
  add a wrapper function to lcms-wrapper.js, and build again.

# demo

- test.html (print to developer console)
- test-wasm.html (WebAssembly, print to developer console)
- http://app.awm.jp/image.js/lcms.html
  - https://github.com/yoya/image.js / lcms.html,lcms.js

# license

MIT License. See LICENSE.
The files in bin/ contain Little-CMS, which is also under the MIT License
(mm2/Little-CMS/LICENSE).
