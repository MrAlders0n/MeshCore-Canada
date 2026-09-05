from __future__ import annotations

import copy
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
        self.assertEqual("Links checked on 2026-08-08", MODULE.contact_check_label(contacts))
        self.assertEqual("Effectuée le 2026-08-08", MODULE.contact_check_label_fr(contacts))

    def test_unreviewed_contacts_remain_explicit(self) -> None:
        contacts = [contact("needs-review")]
        self.assertEqual("Not yet verified", MODULE.contact_check_label(contacts))
        self.assertEqual("Pas encore effectuée", MODULE.contact_check_label_fr(contacts))

    def test_expired_contact_takes_priority(self) -> None:
        contacts = [contact("verified", "2026-08-08"), contact("expired")]
        self.assertEqual("A link needs updating", MODULE.contact_check_label(contacts))
        self.assertEqual("Un lien doit être mis à jour", MODULE.contact_check_label_fr(contacts))


class ReviewDeadlineTests(unittest.TestCase):
    def test_overdue_directory_review_fails_validation(self) -> None:
        data = copy.deepcopy(MODULE.load_data())
        data["metadata"]["review_by"] = "2000-01-01"

        errors = MODULE.validate_data(data).errors

        self.assertTrue(any("metadata.review_by has passed" in error for error in errors))

    def test_expired_contacts_and_overdue_listings_fail_validation(self) -> None:
        data = copy.deepcopy(MODULE.load_data())
        community = data["communities"][0]
        community["verify_by"] = "2000-01-01"
        community["contacts"][0]["health"] = "expired"

        errors = MODULE.validate_data(data).errors

        self.assertTrue(any("is expired" in error for error in errors))
        self.assertTrue(any("overdue for verification" in error for error in errors))

    def test_every_kept_contact_requires_a_check_date(self) -> None:
        data = copy.deepcopy(MODULE.load_data())
        data["communities"][0]["contacts"][0]["last_checked"] = None

        errors = MODULE.validate_data(data).errors

        self.assertTrue(any("must record when the contact was last checked" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
