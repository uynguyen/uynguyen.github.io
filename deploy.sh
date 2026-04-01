git add .
git commit -m "Done"
git push -u origin master
nvm use 12
hexo clean
npm run build
hexo generate
cp -Rf ./public/* ../uynguyen.github.io
cd ../uynguyen.github.io
git add .
git commit -m "deploy"
git push -u origin master --force