import gzip
import http.client
import importlib.util
import tempfile
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path


spec = importlib.util.spec_from_file_location(
    "audit_server", Path(__file__).resolve().parents[2] / "scripts/serve-audit-site.py"
)
audit_server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_server)


class QuietHandler(audit_server.AuditHandler):
    def log_message(self, *args):
        pass


class AuditServerTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        root = Path(self.directory.name)
        self.html = "<h1>Régions du Canada</h1>".encode()
        self.geojson = b'{"type":"FeatureCollection","features":[]}'
        (root / "index.html").write_bytes(self.html)
        (root / "region.geojson").write_bytes(self.geojson)
        self.server = ThreadingHTTPServer(
            ("127.0.0.1", 0), partial(QuietHandler, directory=str(root))
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.directory.cleanup()

    def request(self, path, encoding="", method="GET"):
        connection = http.client.HTTPConnection(*self.server.server_address, timeout=5)
        try:
            connection.request(method, path, headers={"Accept-Encoding": encoding})
            response = connection.getresponse()
            return response.status, dict(response.getheaders()), response.read()
        finally:
            connection.close()

    def test_gzip_preserves_html_and_geometry_and_supports_head(self):
        for path, expected in [("/?tag=ott", self.html), ("/region.geojson", self.geojson)]:
            with self.subTest(path=path):
                status, headers, body = self.request(path, "gzip, deflate, br")
                self.assertEqual(status, 200)
                self.assertEqual(headers.get("Content-Encoding"), "gzip")
                self.assertEqual(headers.get("Vary"), "Accept-Encoding")
                self.assertEqual(gzip.decompress(body), expected)
                status, head_headers, head_body = self.request(path, "gzip", "HEAD")
                self.assertEqual(status, 200)
                self.assertEqual(head_headers.get("Content-Length"), str(len(body)))
                self.assertEqual(head_body, b"")

    def test_plain_requests_and_missing_files_keep_standard_behavior(self):
        for encoding in ["", "br", "gzip;q=0", "gzip;q=0.0", "gzip;q=invalid"]:
            with self.subTest(encoding=encoding):
                status, headers, body = self.request("/", encoding)
                self.assertEqual(status, 200)
                self.assertNotIn("Content-Encoding", headers)
                self.assertEqual(body, self.html)
        self.assertEqual(self.request("/missing.html", "gzip")[0], 404)


if __name__ == "__main__":
    unittest.main()
