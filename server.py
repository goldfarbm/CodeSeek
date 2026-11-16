"""Serve CodeSeek and discover per-language catalogs without dependencies."""

import argparse
import errno
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent


def discover_catalogs(root=ROOT):
    return sorted(
        path.relative_to(root / 'lessons').as_posix()
        for path in (root / 'lessons').glob('*/*.json')
        if path.is_file()
    )


class CodeSeekHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path != '/api/lessons':
            return super().do_GET()
        data = json.dumps(discover_catalogs(Path(self.directory))).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    handler = partial(CodeSeekHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    except OSError as error:
        if error.errno != errno.EADDRINUSE:
            raise
        parser.exit(1, f'Port {args.port} is already in use. Stop the existing server or choose another port:\n'
                       f'  python3 server.py --port {args.port + 1}\n')
    print(f'CodeSeek: http://localhost:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
