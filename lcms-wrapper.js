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

// Localized info, enum cmsInfoType
var cmsInfoDescription  = 0; // (L1503)
var cmsInfoManufacturer = 1;
var cmsInfoModel        = 2;
var cmsInfoCopyright    = 3;

var cmsFLAGS_NOCACHE = 0x0040; // Inhibit 1-pixel cache (1636)

function cmsOpenProfileFromMem(arr, size) { // Uint32Array, number
    return ccall("cmsOpenProfileFromMem", "number", ["array", "number"], [arr, size]);
}
function cmsCloseProfile(hProfile) {
    return ccall("cmsCreate_sRGBProfile", undefined, ["number"], [hProfile]);
}

function cmsCreate_sRGBProfile() { // don't work on emcc -O3
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
