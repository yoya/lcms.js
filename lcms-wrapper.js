"use strict";
/*
 * 2018/03/06- (c) yoya@awm.jp
 * ref) https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#Pointer_stringify
 */

var LCMS_VERSION = 2090; // L81

// Maximum number of channels in ICC Profiles
var cmsMAXCHANNELS = 16; // L654

var cmsSigRedColorantTag   = 0x7258595A; // 'rXYZ' (L382)
var cmsSigGreenColorantTag = 0x6758595A; // 'gXYZ'
var cmsSigBlueColorantTag  = 0x6258595A; // 'bXYZ'

// ICC Color spaces
var cmsSigXYZData   = 0x58595A20; // 'XYZ ' (L433)
var cmsSigLabData   = 0x4C616220; // 'Lab '
var cmsSigLuvData   = 0x4C757620; // 'Luv '
var cmsSigYCbCrData = 0x59436272; // 'YCbr'
var cmsSigYxyData   = 0x59787920; // 'Yxy '
var cmsSigRgbData   = 0x52474220; // 'RGB '
var cmsSigGrayData  = 0x47524159; // 'GRAY'
var cmsSigHsvData   = 0x48535620; // 'HSV '
var cmsSigHlsData   = 0x484C5320; // 'HLS '
var cmsSigCmykData  = 0x434D594B; // 'CMYK'
var cmsSigCmyData   = 0x434D5920; // 'CMY '


// Format of pixel is defined by one cmsUInt32Number, using bit fields as follows
var FLOAT_SH      = function(a) { return ((a) << 22); } // (L674)
var OPTIMIZED_SH  = function(s) { return ((s) << 21); }
var COLORSPACE_SH = function(s) { return ((s) << 16); }
var SWAPFIRST_SH  = function(s) { return ((s) << 14); }
var FLAVOR_SH     = function(s) { return ((s) << 13); }
var PLANAR_SH     = function(p) { return ((p) << 12); }
var ENDIAN16_SH   = function(e) { return ((e) << 11); }
var DOSWAP_SH     = function(e) { return ((e) << 10); }
var EXTRA_SH      = function(e) { return ((e) << 7); }
var CHANNELS_SH   = function(c) { return ((c) << 3); }
var BYTES_SH      = function(b) { return (b); }
// These macros unpack format specifiers into integers
var T_FLOAT      = function(a) { return (((a)>>22)&1); }
var T_OPTIMIZED  = function(o) { return (((o)>>21)&1); }
var T_COLORSPACE = function(s) { return (((s)>>16)&31); }
var T_SWAPFIRST  = function(s) { return (((s)>>14)&1); }
var T_FLAVOR     = function(s) { return (((s)>>13)&1); }
var T_PLANAR     = function(p) { return (((p)>>12)&1); }
var T_ENDIAN16   = function(e) { return (((e)>>11)&1); }
var T_DOSWAP     = function(e) { return (((e)>>10)&1); }
var T_EXTRA      = function(e) { return (((e)>>7)&7); }
var T_CHANNELS   = function(c) { return (((c)>>3)&15); }
var T_BYTES      = function(b) { return ((b)&7); }

// Pixel types
var PT_ANY  = 0; // Don't check colorspace
                 // 1 & 2 are reserved
var PT_GRAY = 3;
var PT_RGB  = 4;
var PT_CMY  = 5;
var PT_CMYK = 6;
// 
var TYPE_RGB_DBL = (FLOAT_SH(1)|COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(0))

// Localized info, enum cmsInfoType
var cmsInfoDescription  = 0; // (L1503)
var cmsInfoManufacturer = 1;
var cmsInfoModel        = 2;
var cmsInfoCopyright    = 3;

// ICC Intents
var INTENT_PERCEPTUAL            = 0; // (L1617)
var INTENT_RELATIVE_COLORIMETRIC = 1;
var INTENT_SATURATION            = 2;
var INTENT_ABSOLUTE_COLORIMETRIC = 3;

var cmsFLAGS_NOCACHE = 0x0040; // Inhibit 1-pixel cache (1636)

function cmsOpenProfileFromMem(arr, size) { // Uint32Array, number
    return ccall("cmsOpenProfileFromMem", "number", ["array", "number"], [arr, size]);
}
function cmsCloseProfile(hProfile) {
    return ccall("cmsCreate_sRGBProfile", undefined, ["number"], [hProfile]);
}

function cmsCreate_sRGBProfile() { // don't work on emcc -O2, -O3
    return ccall("cmsCreate_sRGBProfile", "number", [], []);
}

/*
  usage: hInput, cmsInfoDescription, "en", "US"
*/
function cmsGetProfileInfoASCII(hProfile, info, languageCode, countryCode) {
    
    var len = ccall("cmsGetProfileInfoASCII", "number", ["number", "number", "string", "string", "number", "number"], [hProfile, info, languageCode, countryCode, 0, 0]);
    console.log(len);
    var ptr = _malloc(len);
    var len = ccall("cmsGetProfileInfoASCII", "number", ["number", "number", "string", "string", "number", "number"], [hProfile, info, languageCode, countryCode, ptr, len]);
    var text = Pointer_stringify(ptr, len);
    _free(ptr);
    return text;
}

function cmsGetColorSpace(hProfile) {
    var cs = ccall("cmsGetColorSpace", "number", ["number"], [hProfile]);
    return cs;
}

function cmsFormatterForColorspaceOfProfile(hProfile, nBytes, isFloat) {
    return ccall("cmsFormatterForColorspaceOfProfile", "number", ["number", "number", "number"], [hProfile, nBytes, isFloat]);
}

function cmsCreateTransform(hInput, inputFormat, hOutput, outputFormat, intent, flags) {
    return ccall("cmsCreateTransform", "number", ["number", "number", "number", "number", "number", "number"], [hInput, inputFormat, hOutput, outputFormat, intent, flags]);
}

function  cmsDeleteTransform(hProfile){
    if (! hProfile) {
	console.warn("cmsDeleteTransform: ! hProfile");
	return ;
    }
    ccall("cmsDeleteTransform", undefined, ["number"], [hProfile]);
}

function cmsGetTransformInputFormat(transform) {
    return ccall("cmsGetTransformInputFormat", "number", ["number"], [transform]);
}
function cmsGetTransformOutputFormat(transform) {
    return ccall("cmsGetTransformOutputFormat", "number", ["number"], [transform]);
}

function cmsDoTransform(transform, inputArr, size) {
    var inputFormat = cmsGetTransformOutputFormat(transform);
    var outputFormat = cmsGetTransformOutputFormat(transform);
    // console.debug("inputFormat:"+inputFormat+" outputFormat:"+outputFormat);
    var inputIsFloat = T_FLOAT(inputFormat); // Float64 or Uint16
    var inputBytes = T_BYTES(inputFormat); // Bytews per sample
    var inputChannels = T_CHANNELS(inputFormat); // 3(RGB) or 4(CMYK)
    var inputBytes = T_BYTES(inputFormat);
    inputBytes = (inputBytes < 1)? 8: inputBytes;
    var inputType = inputIsFloat? "double": "i16";
    var outputIsFloat = T_FLOAT(outputFormat);
    var outputChannels = T_CHANNELS(outputFormat);
    var outputBytes = T_BYTES(outputFormat);
    outputBytes = (outputBytes < 1)? 8: outputBytes;
    var outputType = outputIsFloat? "double": "i16";
    //
    var inputBuffer = _malloc(inputChannels * inputBytes * size);
    var outputBuffer = _malloc(outputChannels * outputBytes * size);
    for (var i = 0 ; i < inputChannels * size ; i++) {
	setValue(inputBuffer + inputBytes * i, inputArr[i], inputType);
    }
    ccall("cmsDoTransform", undefined, ["number", "number", "number", "number"], [transform, inputBuffer, outputBuffer, size]);

    if (outputIsFloat) {
	var outputArr = new Float64Array(outputChannels * size);
    } else {
	var outputArr = new Uint16Array(outputChannels * size);
    }
    for (var i = 0 ; i < outputChannels * size ; i++) {
	outputArr[i] = getValue(outputBuffer + outputBytes * i, outputType);
    }
    _free(inputBuffer);
    _free(outputBuffer);
    // console.debug("outputArr", outputArr);
    return outputArr;
}

function cmsReadTag(hProfile, sig) {
    var ptr = ccall("cmsReadTag", undefined, ["number", "number"], [hProfile, sig]);
    return ptr;
}

/* custom function */
function cmsReadTag_XYZ(hProfile, sig) {
    var ptr = cmsReadTag(hProfile, sig);
    if (! ptr) {
	return null;
    }
    var xyz = new Float64Array(3);
    xyz[0]  = getValue(ptr     , "double");
    xyz[1]  = getValue(ptr + 8 , "double");
    xyz[2]  = getValue(ptr + 16, "double");
    return xyz;
}

function cmsXYZ2xyY(xyz) {
    var srcPtr = _malloc(8 * 3);
    var dstPtr = _malloc(8 * 3);
    setValue(srcPtr     , xyz[0], "double");
    setValue(srcPtr + 8 , xyz[1], "double");
    setValue(srcPtr + 16, xyz[2], "double");
    ccall("cmsXYZ2xyY", undefined, ["number", "number"], [dstPtr, srcPtr]);
    var xyY = new Float64Array(3);
    xyY[0] = getValue(dstPtr     , "double");
    xyY[1] = getValue(dstPtr + 8 , "double");
    xyY[2] = getValue(dstPtr + 16, "double");
    _free(srcPtr);
    _free(dstPtr);
    return xyY;
}
