import http.server

if __name__ == "__main__":
	server = http.server.ThreadingHTTPServer(('', 8000), http.server.SimpleHTTPRequestHandler)
	try:
		print("localhost:8000")
		server.serve_forever()
	except KeyboardInterrupt:
		print("\nKeyboard interrupt received, exiting.")

