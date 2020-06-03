echo "building main.js"
browserify src/main.js > build/main.js
echo "building main.css"
lessc src/main.less build/main.css
echo "building index.html"
cp src/index.html build/index.html
echo "finished"

