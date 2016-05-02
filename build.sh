#!/bin/sh
NAME="network-viewer"
BP=build

rm -rf $BP
mkdir -p $BP
mkdir -p $BP/fontawesome
mkdir -p $BP/webcomponentsjs

vulcanize --inline-scripts --inline-css --strip-comments $NAME.html > $BP/$NAME.html

cp -r $NAME-index.html $BP/index.html
cp -r conf/ $BP/
cp -r ../stevia-components/fonts/ $BP/
cp -r ../stevia-components/css/ $BP/
cp -r ../fontawesome/css $BP/fontawesome/
cp -r ../fontawesome/fonts $BP/fontawesome/
cp -r ../webcomponentsjs/*.min.js $BP/webcomponentsjs/

#
# fix index.html paths
#
sed -i s@"\.\./stevia-components/"@@g $BP/index.html
sed -i s@"\.\./"@@g $BP/index.html
## end fix paths
