# MalangPony2 Website

This does not require building or other frameworks.  
Just serve directly on any webserver.

**Important**: You must put the `live2dcubismcore.min.js` file from the official Cubism SDK into the `CubismSDK/` directory. It can be downloaded for free from Cubism's website. 

The website is a single-page app, so you must redirect all pages to `index.html`.  
Otherwise, opening internal links in a new tab, or refreshing will not work.  
For Apache, the `.htaccess` file is provided to do just that.  

You can run the included `testing_webserver.py` script for a simple local testing server.   

Most the code is vanilla HTML, JS and CSS.  
A few external JS libraries are loaded, but they are only ever used for doing one specific thing, more or less.

The files under `jslib/` were all downloaded from jsdelivr.  
NPSFont under `fonts/` is [국민연금체](https://blog.naver.com/pro_nps/223057676647)

All the code is licensed under CC0. Do whatever you want to do with it.  
This does not include the non-code assets and art, which are owned by the original creators.
