#!/bin/bash
filename=$(basename -- "$1")
filename="${filename%.*}"
mkdir $filename.iconset
sips -Z 1024 $1 --out $filename.iconset/icon_512x512@2x.png
sips -Z 512 $1 --out $filename.iconset/icon_512x512.png
sips -Z 512 $1 --out $filename.iconset/icon_256x256@2x.png
sips -Z 256 $1 --out $filename.iconset/icon_256x256.png
sips -Z 256 $1 --out $filename.iconset/icon_128x128@2x.png
sips -Z 128 $1 --out $filename.iconset/icon_128x128.png
sips -Z 64 $1 --out $filename.iconset/icon_32x32@2x.png
sips -Z 32 $1 --out $filename.iconset/icon_32x32.png
sips -Z 32 $1 --out $filename.iconset/icon_16x16@2x.png
sips -Z 16 $1 --out $filename.iconset/icon_16x16.png
iconutil -c icns $filename.iconset
rm -rf $filename.iconset/