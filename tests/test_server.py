import tempfile
import unittest
from pathlib import Path

from server import discover_catalogs


class DiscoveryTests(unittest.TestCase):
    def test_discovers_new_folders_and_arbitrary_json_filenames(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for path in ['lessons/python/lessons.json', 'lessons/ruby/tutorials.json',
                         'lessons/ruby/hello.rb', 'lessons/old.json',
                         'lessons/ruby/nested/ignored.json']:
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text('{}')
            self.assertEqual(discover_catalogs(root), [
                'python/lessons.json', 'ruby/tutorials.json',
            ])
            (root / 'lessons/ruby/tutorials.json').unlink()
            self.assertEqual(discover_catalogs(root), ['python/lessons.json'])


if __name__ == '__main__':
    unittest.main()
