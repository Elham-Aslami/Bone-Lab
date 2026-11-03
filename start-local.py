"""Open a local Bone Lab test session. No files are uploaded or published."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import webbrowser


if __name__ == "__main__":
    website = Path(__file__).resolve().parent / "dist"
    if not (website / "index.html").is_file():
        raise SystemExit("Extract the full ZIP first. The dist folder must be next to this launcher.")
    handler = partial(SimpleHTTPRequestHandler, directory=str(website))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", 8000), handler)
    except OSError:
        raise SystemExit("Port 8000 is in use. Close your earlier Bone Lab server, then run this launcher again.")
    Thread(target=server.serve_forever, daemon=True).start()
    print("Bone Lab is ready at http://127.0.0.1:8000/")
    print("Keep this window open while testing. Press Enter here to stop.")
    webbrowser.open("http://127.0.0.1:8000/")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        pass
    finally:
        server.shutdown()
        server.server_close()
