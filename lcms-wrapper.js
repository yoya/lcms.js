"use strict";
/*
 * 2018/03/06- (c) yoya@awm.jp
 * ref) https://emscripten.org/docs/api_reference/preamble.js.html
 *
 * The emscripten runtime is used through the Module object only
 * (Module.ccall, Module._malloc, Module.HEAPU8, ...). Optimized builds
 * of recent emscripten do not define them as global variables.
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
var PT_ANY   = 0; // Don't check colorspace // (L701)
                      // 1 & 2 are reserved
var PT_GRAY  = 3;
var PT_RGB   = 4;
var PT_CMY   = 5;
var PT_CMYK  = 6;
var PT_YCbCr = 7;
var PT_YUV   = 8; // Lu'v'
var PT_XYZ   = 9;
var PT_Lab   = 10;
var PT_YUVK  = 11; // Lu'v'K
var PT_HSV   = 12;
var PT_HLS   = 13;
var PT_Yxy   = 14;

var PT_MCH1  = 15;
var PT_MCH2  = 16;
var PT_MCH3  = 17;
var PT_MCH4  = 18;
var PT_MCH5  = 19;
var PT_MCH6  = 20;
var PT_MCH7  = 21;
var PT_MCH8  = 22;
var PT_MCH9  = 23;
var PT_MCH10 = 24;
var PT_MCH11 = 25;
var PT_MCH12 = 26;
var PT_MCH13 = 27;
var PT_MCH14 = 28;
var PT_MCH15 = 29;

var PT_LabV2 = 30; // Identical to PT_Lab, but using the V2 old encoding

var TYPE_GRAY_8          = (COLORSPACE_SH(PT_GRAY)|CHANNELS_SH(1)|BYTES_SH(1)); // (L739)
var TYPE_GRAY_8_REV      = (COLORSPACE_SH(PT_GRAY)|CHANNELS_SH(1)|BYTES_SH(1)|FLAVOR_SH(1));
var TYPE_GRAY_16         = (COLORSPACE_SH(PT_GRAY)|CHANNELS_SH(1)|BYTES_SH(2));
var TYPE_GRAY_16_REV     = (COLORSPACE_SH(PT_GRAY)|CHANNELS_SH(1)|BYTES_SH(2)|FLAVOR_SH(1));
var TYPE_GRAY_16_SE      = (COLORSPACE_SH(PT_GRAY)|CHANNELS_SH(1)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_GRAYA_8         = (COLORSPACE_SH(PT_GRAY)|EXTRA_SH(1)|CHANNELS_SH(1)|BYTES_SH(1));
var TYPE_GRAYA_16        = (COLORSPACE_SH(PT_GRAY)|EXTRA_SH(1)|CHANNELS_SH(1)|BYTES_SH(2));
var TYPE_GRAYA_16_SE     = (COLORSPACE_SH(PT_GRAY)|EXTRA_SH(1)|CHANNELS_SH(1)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_GRAYA_8_PLANAR  = (COLORSPACE_SH(PT_GRAY)|EXTRA_SH(1)|CHANNELS_SH(1)|BYTES_SH(1)|PLANAR_SH(1));
var TYPE_GRAYA_16_PLANAR = (COLORSPACE_SH(PT_GRAY)|EXTRA_SH(1)|CHANNELS_SH(1)|BYTES_SH(2)|PLANAR_SH(1));

var TYPE_RGB_8         = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(1));
var TYPE_RGB_8_PLANAR  = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(1)|PLANAR_SH(1));
var TYPE_BGR_8         = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_BGR_8_PLANAR  = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(1)|DOSWAP_SH(1)|PLANAR_SH(1));
var TYPE_RGB_16        = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(2));
var TYPE_RGB_16_PLANAR = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(2)|PLANAR_SH(1));
var TYPE_RGB_16_SE     = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_BGR_16        = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_BGR_16_PLANAR = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1)|PLANAR_SH(1));
var TYPE_BGR_16_SE     = (COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));

var TYPE_RGBA_8         = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1));
var TYPE_RGBA_8_PLANAR  = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|PLANAR_SH(1));
var TYPE_RGBA_16        = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2));
var TYPE_RGBA_16_PLANAR = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|PLANAR_SH(1));
var TYPE_RGBA_16_SE     = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|ENDIAN16_SH(1));

var TYPE_ARGB_8         = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|SWAPFIRST_SH(1));
var TYPE_ARGB_8_PLANAR  = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|SWAPFIRST_SH(1)|PLANAR_SH(1));
var TYPE_ARGB_16        = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|SWAPFIRST_SH(1));

var TYPE_ABGR_8         = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_ABGR_8_PLANAR  = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|DOSWAP_SH(1)|PLANAR_SH(1));
var TYPE_ABGR_16        = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_ABGR_16_PLANAR = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1)|PLANAR_SH(1));
var TYPE_ABGR_16_SE     = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));

var TYPE_BGRA_8        = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|DOSWAP_SH(1)|SWAPFIRST_SH(1));
var TYPE_BGRA_8_PLANAR = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(1)|DOSWAP_SH(1)|SWAPFIRST_SH(1)|PLANAR_SH(1));
var TYPE_BGRA_16       = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|DOSWAP_SH(1)|SWAPFIRST_SH(1));
var TYPE_BGRA_16_SE    = (COLORSPACE_SH(PT_RGB)|EXTRA_SH(1)|CHANNELS_SH(3)|BYTES_SH(2)|ENDIAN16_SH(1)|DOSWAP_SH(1)|SWAPFIRST_SH(1));

var TYPE_CMY_8          = (COLORSPACE_SH(PT_CMY)|CHANNELS_SH(3)|BYTES_SH(1));
var TYPE_CMY_8_PLANAR   = (COLORSPACE_SH(PT_CMY)|CHANNELS_SH(3)|BYTES_SH(1)|PLANAR_SH(1));
var TYPE_CMY_16         = (COLORSPACE_SH(PT_CMY)|CHANNELS_SH(3)|BYTES_SH(2));
var TYPE_CMY_16_PLANAR  = (COLORSPACE_SH(PT_CMY)|CHANNELS_SH(3)|BYTES_SH(2)|PLANAR_SH(1));
var TYPE_CMY_16_SE      = (COLORSPACE_SH(PT_CMY)|CHANNELS_SH(3)|BYTES_SH(2)|ENDIAN16_SH(1));

var TYPE_CMYK_8         = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(1));
var TYPE_CMYKA_8        = (COLORSPACE_SH(PT_CMYK)|EXTRA_SH(1)|CHANNELS_SH(4)|BYTES_SH(1));
var TYPE_CMYK_8_REV     = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(1)|FLAVOR_SH(1));
var TYPE_YUVK_8         =  TYPE_CMYK_8_REV;
var TYPE_CMYK_8_PLANAR  = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(1)|PLANAR_SH(1));
var TYPE_CMYK_16        = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2));
var TYPE_CMYK_16_REV    = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|FLAVOR_SH(1));
var TYPE_YUVK_16        =  TYPE_CMYK_16_REV;
var TYPE_CMYK_16_PLANAR = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|PLANAR_SH(1));
var TYPE_CMYK_16_SE     = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|ENDIAN16_SH(1));

var TYPE_KYMC_8      = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC_16     = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC_16_SE  = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));

var TYPE_KCMY_8      = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(1)|SWAPFIRST_SH(1));
var TYPE_KCMY_8_REV  = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(1)|FLAVOR_SH(1)|SWAPFIRST_SH(1));
var TYPE_KCMY_16     = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|SWAPFIRST_SH(1));
var TYPE_KCMY_16_REV = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|FLAVOR_SH(1)|SWAPFIRST_SH(1));
var TYPE_KCMY_16_SE  = (COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(2)|ENDIAN16_SH(1)|SWAPFIRST_SH(1));

var TYPE_CMYK5_8         = (COLORSPACE_SH(PT_MCH5)|CHANNELS_SH(5)|BYTES_SH(1));
var TYPE_CMYK5_16        = (COLORSPACE_SH(PT_MCH5)|CHANNELS_SH(5)|BYTES_SH(2));
var TYPE_CMYK5_16_SE     = (COLORSPACE_SH(PT_MCH5)|CHANNELS_SH(5)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC5_8         = (COLORSPACE_SH(PT_MCH5)|CHANNELS_SH(5)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC5_16        = (COLORSPACE_SH(PT_MCH5)|CHANNELS_SH(5)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC5_16_SE     = (COLORSPACE_SH(PT_MCH5)|CHANNELS_SH(5)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));
var TYPE_CMYK6_8         = (COLORSPACE_SH(PT_MCH6)|CHANNELS_SH(6)|BYTES_SH(1));
var TYPE_CMYK6_8_PLANAR  = (COLORSPACE_SH(PT_MCH6)|CHANNELS_SH(6)|BYTES_SH(1)|PLANAR_SH(1));
var TYPE_CMYK6_16        = (COLORSPACE_SH(PT_MCH6)|CHANNELS_SH(6)|BYTES_SH(2));
var TYPE_CMYK6_16_PLANAR = (COLORSPACE_SH(PT_MCH6)|CHANNELS_SH(6)|BYTES_SH(2)|PLANAR_SH(1));
var TYPE_CMYK6_16_SE     = (COLORSPACE_SH(PT_MCH6)|CHANNELS_SH(6)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_CMYK7_8         = (COLORSPACE_SH(PT_MCH7)|CHANNELS_SH(7)|BYTES_SH(1));
var TYPE_CMYK7_16        = (COLORSPACE_SH(PT_MCH7)|CHANNELS_SH(7)|BYTES_SH(2));
var TYPE_CMYK7_16_SE     = (COLORSPACE_SH(PT_MCH7)|CHANNELS_SH(7)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC7_8         = (COLORSPACE_SH(PT_MCH7)|CHANNELS_SH(7)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC7_16        = (COLORSPACE_SH(PT_MCH7)|CHANNELS_SH(7)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC7_16_SE     = (COLORSPACE_SH(PT_MCH7)|CHANNELS_SH(7)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));
var TYPE_CMYK8_8         = (COLORSPACE_SH(PT_MCH8)|CHANNELS_SH(8)|BYTES_SH(1));
var TYPE_CMYK8_16        = (COLORSPACE_SH(PT_MCH8)|CHANNELS_SH(8)|BYTES_SH(2));
var TYPE_CMYK8_16_SE     = (COLORSPACE_SH(PT_MCH8)|CHANNELS_SH(8)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC8_8         = (COLORSPACE_SH(PT_MCH8)|CHANNELS_SH(8)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC8_16        = (COLORSPACE_SH(PT_MCH8)|CHANNELS_SH(8)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC8_16_SE     = (COLORSPACE_SH(PT_MCH8)|CHANNELS_SH(8)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));
var TYPE_CMYK9_8         = (COLORSPACE_SH(PT_MCH9)|CHANNELS_SH(9)|BYTES_SH(1));
var TYPE_CMYK9_16        = (COLORSPACE_SH(PT_MCH9)|CHANNELS_SH(9)|BYTES_SH(2));
var TYPE_CMYK9_16_SE     = (COLORSPACE_SH(PT_MCH9)|CHANNELS_SH(9)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC9_8         = (COLORSPACE_SH(PT_MCH9)|CHANNELS_SH(9)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC9_16        = (COLORSPACE_SH(PT_MCH9)|CHANNELS_SH(9)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC9_16_SE     = (COLORSPACE_SH(PT_MCH9)|CHANNELS_SH(9)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));
var TYPE_CMYK10_8        = (COLORSPACE_SH(PT_MCH10)|CHANNELS_SH(10)|BYTES_SH(1));
var TYPE_CMYK10_16       = (COLORSPACE_SH(PT_MCH10)|CHANNELS_SH(10)|BYTES_SH(2));
var TYPE_CMYK10_16_SE    = (COLORSPACE_SH(PT_MCH10)|CHANNELS_SH(10)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC10_8        = (COLORSPACE_SH(PT_MCH10)|CHANNELS_SH(10)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC10_16       = (COLORSPACE_SH(PT_MCH10)|CHANNELS_SH(10)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC10_16_SE    = (COLORSPACE_SH(PT_MCH10)|CHANNELS_SH(10)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));
var TYPE_CMYK11_8        = (COLORSPACE_SH(PT_MCH11)|CHANNELS_SH(11)|BYTES_SH(1));
var TYPE_CMYK11_16       = (COLORSPACE_SH(PT_MCH11)|CHANNELS_SH(11)|BYTES_SH(2));
var TYPE_CMYK11_16_SE    = (COLORSPACE_SH(PT_MCH11)|CHANNELS_SH(11)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC11_8        = (COLORSPACE_SH(PT_MCH11)|CHANNELS_SH(11)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC11_16       = (COLORSPACE_SH(PT_MCH11)|CHANNELS_SH(11)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC11_16_SE    = (COLORSPACE_SH(PT_MCH11)|CHANNELS_SH(11)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));
var TYPE_CMYK12_8        = (COLORSPACE_SH(PT_MCH12)|CHANNELS_SH(12)|BYTES_SH(1));
var TYPE_CMYK12_16       = (COLORSPACE_SH(PT_MCH12)|CHANNELS_SH(12)|BYTES_SH(2));
var TYPE_CMYK12_16_SE    = (COLORSPACE_SH(PT_MCH12)|CHANNELS_SH(12)|BYTES_SH(2)|ENDIAN16_SH(1));
var TYPE_KYMC12_8        = (COLORSPACE_SH(PT_MCH12)|CHANNELS_SH(12)|BYTES_SH(1)|DOSWAP_SH(1));
var TYPE_KYMC12_16       = (COLORSPACE_SH(PT_MCH12)|CHANNELS_SH(12)|BYTES_SH(2)|DOSWAP_SH(1));
var TYPE_KYMC12_16_SE    = (COLORSPACE_SH(PT_MCH12)|CHANNELS_SH(12)|BYTES_SH(2)|DOSWAP_SH(1)|ENDIAN16_SH(1));

// Colorimetric
var TYPE_XYZ_16   = (COLORSPACE_SH(PT_XYZ)|CHANNELS_SH(3)|BYTES_SH(2));
var TYPE_Lab_8    = (COLORSPACE_SH(PT_Lab)|CHANNELS_SH(3)|BYTES_SH(1));
var TYPE_LabV2_8  = (COLORSPACE_SH(PT_LabV2)|CHANNELS_SH(3)|BYTES_SH(1));

var TYPE_ALab_8   = (COLORSPACE_SH(PT_Lab)|CHANNELS_SH(3)|BYTES_SH(1)|EXTRA_SH(1)|SWAPFIRST_SH(1));
var TYPE_ALabV2_8 = (COLORSPACE_SH(PT_LabV2)|CHANNELS_SH(3)|BYTES_SH(1)|EXTRA_SH(1)|SWAPFIRST_SH(1));
var TYPE_Lab_16   = (COLORSPACE_SH(PT_Lab)|CHANNELS_SH(3)|BYTES_SH(2));
var TYPE_LabV2_16 = (COLORSPACE_SH(PT_LabV2)|CHANNELS_SH(3)|BYTES_SH(2));
var TYPE_Yxy_16   = (COLORSPACE_SH(PT_Yxy)|CHANNELS_SH(3)|BYTES_SH(2));

// Floating point formatters.
// NOTE THAT 'BYTES' FIELD IS SET TO ZERO ON DLB because 8 bytes overflows the bitfield
var TYPE_XYZ_DBL  = (FLOAT_SH(1)|COLORSPACE_SH(PT_XYZ)|CHANNELS_SH(3)|BYTES_SH(0)); // (L916)
var TYPE_Lab_DBL  = (FLOAT_SH(1)|COLORSPACE_SH(PT_Lab)|CHANNELS_SH(3)|BYTES_SH(0));
var TYPE_GRAY_DBL = (FLOAT_SH(1)|COLORSPACE_SH(PT_GRAY)|CHANNELS_SH(1)|BYTES_SH(0));
var TYPE_RGB_DBL  = (FLOAT_SH(1)|COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(0));
var TYPE_BGR_DBL  = (FLOAT_SH(1)|COLORSPACE_SH(PT_RGB)|CHANNELS_SH(3)|BYTES_SH(0)|DOSWAP_SH(1));
var TYPE_CMYK_DBL = (FLOAT_SH(1)|COLORSPACE_SH(PT_CMYK)|CHANNELS_SH(4)|BYTES_SH(0))

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


// Flags
var cmsFLAGS_NOCACHE       = 0x0040; // Inhibit 1-pixel cache (L1636)
var cmsFLAGS_NOOPTIMIZE    = 0x0100; // Inhibit optimizations
var cmsFLAGS_NULLTRANSFORM = 0x0200; // Don't transform anyway

// Proofing flags
var cmsFLAGS_GAMUTCHECK   = 0x1000; // Out of Gamut alarm
var cmsFLAGS_SOFTPROOFING = 0x4000; // Do softproofing

// Misc
var cmsFLAGS_BLACKPOINTCOMPENSATION = 0x2000;
var cmsFLAGS_NOWHITEONWHITEFIXUP    = 0x0004; // Don't fix scum dot
var cmsFLAGS_HIGHRESPRECALC         = 0x0400; // Use more memory to give better accurancy
var cmsFLAGS_LOWRESPRECALC          = 0x0800; // Use less memory to minimize resources

function cmsOpenProfileFromMem(arr, size) { // Uint8Array, number
    // not ccall "array" type, it allocates on the (small) stack.
    var ptr = Module._malloc(size);
    if (arr.length > size) {
	arr = Array.prototype.slice.call(arr, 0, size);
    }
    Module.HEAPU8.set(arr, ptr);
    var hProfile = Module.ccall("cmsOpenProfileFromMem", "number", ["number", "number"], [ptr, size]);
    Module._free(ptr); // lcms keeps its own copy.
    return hProfile;
}
function cmsCloseProfile(hProfile) {
    return Module.ccall("cmsCloseProfile", "number", ["number"], [hProfile]);
}

function cmsCreate_sRGBProfile() { // don't work on emcc -O2, -O3
    return Module.ccall("cmsCreate_sRGBProfile", "number", [], []);
}
function cmsCreateXYZProfile() {
    return Module.ccall("cmsCreateXYZProfile", "number", [], []);
}
function cmsCreateLab4Profile(wpArr) {
    var whitePoint = 0;
    if (wpArr) {
	whitePoint = Module._malloc(8 * 3); // cmsCIExyY* WhitePoint
	for (var i = 0 ; i < 3 ; i++) {
	    Module.setValue(whitePoint + i * 8, wpArr[i], "double");
	}
    }
    var prof = Module.ccall("cmsCreateLab4Profile", "number", ["number"], [whitePoint]);
    if (whitePoint) {
	Module._free(whitePoint);
    }
    return prof;
}

/*
  usage: hInput, cmsInfoDescription, "en", "US"
*/
function cmsGetProfileInfoASCII(hProfile, info, languageCode, countryCode) {
    
    var len = Module.ccall("cmsGetProfileInfoASCII", "number", ["number", "number", "string", "string", "number", "number"], [hProfile, info, languageCode, countryCode, 0, 0]);
    if (len <= 0) {
	return "";
    }
    var ptr = Module._malloc(len);
    len = Module.ccall("cmsGetProfileInfoASCII", "number", ["number", "number", "string", "string", "number", "number"], [hProfile, info, languageCode, countryCode, ptr, len]);
    // len includes the terminating NUL
    var text = (len > 1)? Module.UTF8ToString(ptr): "";
    Module._free(ptr);
    return text;
}

function cmsGetColorSpace(hProfile) {
    var cs = Module.ccall("cmsGetColorSpace", "number", ["number"], [hProfile]);
    return cs;
}

function cmsFormatterForColorspaceOfProfile(hProfile, nBytes, isFloat) {
    return Module.ccall("cmsFormatterForColorspaceOfProfile", "number", ["number", "number", "number"], [hProfile, nBytes, isFloat]);
}

function cmsCreateTransform(hInput, inputFormat, hOutput, outputFormat, intent, flags) {
    return Module.ccall("cmsCreateTransform", "number", ["number", "number", "number", "number", "number", "number"], [hInput, inputFormat, hOutput, outputFormat, intent, flags]);
}

function cmsCreateProofingTransform(hInput, inputFormat, hOutput, outputFormat, proofing, intent, proofingIntent, flags) {
    console.log(intent);
    return Module.ccall("cmsCreateProofingTransform", "number", ["number", "number", "number", "number", "number", "number", "number", "number"], [hInput, inputFormat, hOutput, outputFormat, proofing, intent, proofingIntent, flags]);
}

function  cmsDeleteTransform(transform){
    if (! transform) {
	console.warn("cmsDeleteTransform: ! transform");
	return ;
    }
    Module.ccall("cmsDeleteTransform", undefined, ["number"], [transform]);
}

function cmsGetTransformInputFormat(transform) {
    return Module.ccall("cmsGetTransformInputFormat", "number", ["number"], [transform]);
}
function cmsGetTransformOutputFormat(transform) {
    return Module.ccall("cmsGetTransformOutputFormat", "number", ["number"], [transform]);
}

// HEAP view for the sample type. Look it up on every use,
// the views are replaced when the memory grows.
function heapByBytes(bytes, isFloat) {
    if (isFloat) {
	switch(bytes) {
	case 4: return Module.HEAPF32;
	case 8: return Module.HEAPF64;
	}
    } else {
	switch(bytes) {
	case 1: return Module.HEAPU8;
	case 2: return Module.HEAPU16;
	}
    }
    console.error("heapByBytes(bytes:"+bytes+", isFloat:"+isFloat+")");
    return null;
}

function cmsDoTransform(transform, inputArr, size) {
    var inputFormat  = cmsGetTransformInputFormat(transform);
    var outputFormat = cmsGetTransformOutputFormat(transform);
    // console.debug("transform:"+transform);
    var inputIsFloat  = T_FLOAT(inputFormat); // Float64 or Uint16
    var outputIsFloat = T_FLOAT(outputFormat);
    // color channels (3:RGB, 4:CMYK) + extra channels (alpha etc.)
    var inputChannels  = T_CHANNELS(inputFormat) + T_EXTRA(inputFormat);
    var outputChannels = T_CHANNELS(outputFormat) + T_EXTRA(outputFormat);
    var inputBytes  = T_BYTES(inputFormat); // Bytews per sample
    var outputBytes = T_BYTES(outputFormat);
    inputBytes  = (inputBytes < 1)? 8: inputBytes;
    outputBytes = (outputBytes < 1)? 8: outputBytes;
    if ((! heapByBytes(inputBytes, inputIsFloat)) ||
	(! heapByBytes(outputBytes, outputIsFloat))) {
	return null; // unsupported sample type
    }
    var inputLen  = inputChannels * size;
    var outputLen = outputChannels * size;
    //
    var inputBuffer = Module._malloc(inputBytes * inputLen);
    var outputBuffer = Module._malloc(outputBytes * outputLen);
    // _malloc returns an 8 bytes aligned pointer.
    var inputOffset = inputBuffer / inputBytes;
    var inputHeap = heapByBytes(inputBytes, inputIsFloat).subarray(inputOffset, inputOffset + inputLen);
    if (inputArr.length < inputLen) {
	inputHeap.fill(0);
    } else if (inputArr.length > inputLen) {
	inputArr = Array.prototype.slice.call(inputArr, 0, inputLen);
    }
    inputHeap.set(inputArr);
    Module.ccall("cmsDoTransform", undefined, ["number", "number", "number", "number"], [transform, inputBuffer, outputBuffer, size]);

    if (outputIsFloat) {
	var outputArr = new Float64Array(outputLen);
    } else {
	var outputArr = new Uint16Array(outputLen);
    }
    var outputOffset = outputBuffer / outputBytes;
    outputArr.set(heapByBytes(outputBytes, outputIsFloat).subarray(outputOffset, outputOffset + outputLen));
    Module._free(inputBuffer);
    Module._free(outputBuffer);
    // console.debug("outputArr", outputArr);
    return outputArr;
}

function cmsReadTag(hProfile, sig) {
    var ptr = Module.ccall("cmsReadTag", undefined, ["number", "number"], [hProfile, sig]);
    return ptr;
}

/* custom function */
function cmsReadTag_XYZ(hProfile, sig) {
    var ptr = cmsReadTag(hProfile, sig);
    if (! ptr) {
	return null;
    }
    var xyz = new Float64Array(3);
    xyz[0]  = Module.getValue(ptr     , "double");
    xyz[1]  = Module.getValue(ptr + 8 , "double");
    xyz[2]  = Module.getValue(ptr + 16, "double");
    return xyz;
}

function cmsXYZ2xyY(xyz) {
    var srcPtr = Module._malloc(8 * 3);
    var dstPtr = Module._malloc(8 * 3);
    Module.setValue(srcPtr     , xyz[0], "double");
    Module.setValue(srcPtr + 8 , xyz[1], "double");
    Module.setValue(srcPtr + 16, xyz[2], "double");
    Module.ccall("cmsXYZ2xyY", undefined, ["number", "number"], [dstPtr, srcPtr]);
    var xyY = new Float64Array(3);
    xyY[0] = Module.getValue(dstPtr     , "double");
    xyY[1] = Module.getValue(dstPtr + 8 , "double");
    xyY[2] = Module.getValue(dstPtr + 16, "double");
    Module._free(srcPtr);
    Module._free(dstPtr);
    return xyY;
}
