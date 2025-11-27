import http.server
import socketserver

rewrite_map={
	"/news":"/",
	"/about":"/",
	"/previous":"/",
	"/coc":"/",
	"/mascot":"/",
	"/timetable":"/",
	"/venue":"/",
	"/conbook":"/",
	"/register":"/",
	"/involved":"/",
	"/credits":"/",
	"/inquiries":"/",
	"/internal":"/",
	"/panelist":"/",
	"/vendor":"/",
	"/artgallery":"/",
	"/faq":"/"
	}
PORT = 8003

class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
	def __init__(self,*args,**kwargs):
		super().__init__(*args,**kwargs)
	def _rewrite_path(self):
		orig_path=self.path
		if self.path in rewrite_map:
			self.path=rewrite_map[self.path]
			print("Rewrite",repr(orig_path),"to",repr(self.path))
	def do_HEAD(self,*args,**kwargs):
		self._rewrite_path()
		return super().do_HEAD(*args,**kwargs)
	def do_GET(self,*args,**kwargs):
		self._rewrite_path()
		return super().do_GET(*args,**kwargs)
	def log_message(self,fmt,*args):
		# Ignore
		return
			
print(F"Running test server at localhost:{PORT}")
with http.server.ThreadingHTTPServer(("", PORT), CustomRequestHandler) as httpd:
	try:
		httpd.serve_forever()
	except KeyboardInterrupt:
		pass
print("Exiting.")
