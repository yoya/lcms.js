#!/bin/sh
# WebAssembly build. (tested with emcc 6.0.13)
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

$EMCC -O2 -o $BIN_DIR/lcms-wasm.js -I $INCLUDE_DIR $SRC_DIR/*.c -s EXPORTED_FUNCTIONS=$exported -s EXPORTED_RUNTIME_METHODS=$RUNTIME_METHODS -s INITIAL_MEMORY=33554432 -s ALLOW_MEMORY_GROWTH=1
# emcc sets the executable bit on the .wasm file.
chmod 644 $BIN_DIR/lcms-wasm.wasm
