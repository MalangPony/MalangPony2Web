# MalangPony2 Website

Webpage for MalangPony2, a Korean brony event.

### Serving the Page

This does not require building or pre-processing. Just serve directly on any webserver.

**Important**: You must put the `live2dcubismcore.min.js` file from the official Cubism SDK into the `CubismSDK/` directory. It can be downloaded for free from Cubism's website. 

The website is a single-page app, so you must redirect all pages to `index.html`.  
Otherwise, opening internal links in a new tab, or refreshing will not work.  
For Apache, the `.htaccess` file is provided to do just that.  

You can run the included `testing_webserver.py` script for a simple local testing server.   

### The Code

Most the code is vanilla HTML, JS and CSS.  
A few external JS libraries are loaded, but they are only ever used for doing one specific thing, more or less.  

All the code is written by SheepPony, without the use of AI, as Celestia intended.  
You can rest assured that every single line of crappy code here can be fully attributed to human stupidity and incompetence.  

### Attribution and License

The files under `jslib/` were all downloaded from jsdelivr.  
NPSFont under `fonts/` is [국민연금체](https://blog.naver.com/pro_nps/223057676647)

All the code is licensed under CC0. Do whatever you want to do with it.  
This does not include the non-code assets and art, which are owned by the original creators.
