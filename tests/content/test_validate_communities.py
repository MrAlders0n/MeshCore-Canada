from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "validate-communities.py"
SPEC = importlib.util.spec_from_file_location("validate_communities", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def contact(health: str, last_checked: str | None = None) -> dict[str, str | None]:
    return {"health": health, "last_checked": last_checked}


class ContactCheckLabelTests(unittest.TestCase):
    def test_verified_contact_shows_its_check_date(self) -> None:
        contacts = [contact("verified", "2026-08-08")]
        self.assertEqual("Verified on 2026-08-08", MODULE.contact_check_label(contacts))
        self.assertEqual("Effectuée le 2026-08-08", MODULE.contact_check_label_fr(contacts))

    def test_unreviewed_contacts_remain_explicit(self) -> None:
        contacts = [contact("needs-review")]
        self.assertEqual("Not yet verified", MODULE.contact_check_label(contacts))
        self.assertEqual("Pas encore effectuée", MODULE.contact_check_label_fr(contacts))

    def test_expired_contact_takes_priority(self) -> None:
        contacts = [contact("verified", "2026-08-08"), contact("expired")]
        self.assertEqual("A link needs updating", MODULE.contact_check_label(contacts))
        self.assertEqual("Un lien doit être mis à jour", MODULE.contact_check_label_fr(contacts))


if __name__ == "__main__":
    unittest.main()
