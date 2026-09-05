"""Local-only Lighthouse server with the HTTP gzip used by GitHub Pages."""

import argparse
import gzip
import io
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


def accepts_gzip(header):
    for item in header.lower().split(","):
        name, *options = (part.strip() for part in item.split(";"))
        if name != "gzip":
            continue
        for option in options:
            if option.startswith("q="):
                try:
                    return float(option[2:]) > 0
                except ValueError:
                    return False
        return True
    return False


class AuditHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir() and urlsplit(self.path).path.endswith("/"):
            path = path / "index.html"
        compressible = path.suffix.lower() in {
            ".html", ".css", ".js", ".json", ".geojson", ".svg", ".xml", ".txt"
        }
        if not (compressible and path.is_file() and accepts_gzip(self.headers.get("Accept-Encoding", ""))):
            return super().send_head()
        try:
            payload = gzip.compress(path.read_bytes(), compresslevel=6, mtime=0)
        except OSError:
            return super().send_head()
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Encoding", "gzip")
        self.send_header("Vary", "Accept-Encoding")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        return io.BytesIO(payload)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", default=".tmp/site", type=Path)
    parser.add_argument("--port", default=4174, type=int)
    args = parser.parse_args()
    if not args.directory.is_dir():
        parser.error("Build the site before starting the audit server.")
    handler = partial(AuditHandler, directory=str(args.directory.resolve()))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        server.serve_forever()
