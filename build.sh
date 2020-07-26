echo "building main.js"
# browserify src/main.js > build/main.js
node build.js > build/main.js
echo "building main.css"
sass src/main.scss build/main.css
echo "building index.html"
cp src/index.html build/index.html
echo "copying images"
rm -r build/images
cp -r src/images build/images
echo "finished"

