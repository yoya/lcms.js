#!/bin/sh
# JavaScript (asm.js compatible, wasm2js) build. (tested with emcc 6.0.13)
EMCC=emcc
SRC_DIR=mm2/Little-CMS/src
INCLUDE_DIR=mm2/Little-CMS/include
BIN_DIR=bin
SYMBOLS=$(cat export.txt)

# lcms-wrapper.js needs malloc/free and these runtime methods on Module.
exported="_malloc,_free"
for s in $SYMBOLS
do exported="$exported,_$s"
done
RUNTIME_METHODS=ccall,getValue,setValue,UTF8ToString,HEAPU8,HEAPU16,HEAPF32,HEAPF64,FS

# WASM=0: JavaScript output instead of WebAssembly.
# WASM_ASYNC_COMPILATION=0: usable right after the script is loaded.
COMMON_OPT="-s WASM=0 -s WASM_ASYNC_COMPILATION=0 -s EXPORTED_RUNTIME_METHODS=$RUNTIME_METHODS -s INITIAL_MEMORY=33554432 -s ALLOW_MEMORY_GROWTH=1"

$EMCC -O2 -o $BIN_DIR/lcms.js -I $INCLUDE_DIR $SRC_DIR/*.c -s EXPORTED_FUNCTIONS=$exported $COMMON_OPT

$EMCC -O1 -o $BIN_DIR/lcms-O1.js -I $INCLUDE_DIR $SRC_DIR/*.c -s EXPORTED_FUNCTIONS=$exported $COMMON_OPT

$EMCC -O2 -o $BIN_DIR/lcms-all.js -I $INCLUDE_DIR $SRC_DIR/*.c -s EXPORT_ALL=1 -s LINKABLE=1 $COMMON_OPT
