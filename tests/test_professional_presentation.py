"""Guardas estáticas da apresentação profissional e retorno das aplicações."""
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class Elements(HTMLParser):
    def __init__(self, content):
        super().__init__()
        self.elements = []
        self.feed(content)
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

class ProfessionalPresentationTests(unittest.TestCase):
    def test_roles_are_product_and_technology_collaboration(self):
        for path in ("index.html", "README.md", "gt360/README.md", "eu-horizonte-intranet/README.md"):
            content = (ROOT / path).read_text(encoding="utf-8")
            self.assertIsNone(re.search(r"full[\\s-]*stack", content, re.I), path)
            self.assertIn("Tecnologia", content, path)
            self.assertIn("Product Owner", content, path)
        self.assertIn("Scrum Master", (ROOT / "index.html").read_text(encoding="utf-8"))

    def test_landing_focuses_on_applications_and_short_bio(self):
        content = (ROOT / "index.html").read_text(encoding="utf-8")
        elements = Elements(content).elements
        ids = {attrs.get("id") for _, attrs in elements}
        projects = [attrs for tag, attrs in elements if tag == "article"
                    and "project-card" in attrs.get("class", "").split()]
        self.assertEqual(len(projects), 2)
        self.assertEqual({attrs["id"] for attrs in projects}, {"gt360-projeto", "eu-horizonte"})
        self.assertIn("sobre", ids)
        self.assertTrue({"experiencia", "formacao", "certificacoes", "acoes-dho"}.isdisjoint(ids))
        self.assertIn("que <span>projetei.</span>", content)
        self.assertIn("Protótipo navegável", content)
        self.assertIn("Demonstração pública", content)

    def test_landing_anchors_resolve_and_ids_are_unique(self):
        elements = Elements((ROOT / "index.html").read_text(encoding="utf-8")).elements
        ids = [attrs["id"] for _, attrs in elements if attrs.get("id")]
        self.assertEqual(len(ids), len(set(ids)))
        for tag, attrs in elements:
            href = attrs.get("href", "")
            if tag == "a" and href.startswith("#"):
                self.assertIn(href[1:], ids, href)

    def test_public_applications_have_portfolio_return(self):
        for path in ("gt360/index.html", "eu-horizonte-intranet/index.html"):
            elements = Elements((ROOT / path).read_text(encoding="utf-8")).elements
            links = [attrs for tag, attrs in elements if tag == "a" and "portfolio-return" in attrs.get("class", "").split()]
            self.assertEqual(len(links), 1, path)
            self.assertEqual(links[0]["href"], "../#projetos")
            self.assertEqual(links[0]["aria-label"], "Voltar ao portfólio profissional")
            self.assertTrue((ROOT / Path(path).parent / links[0]["href"].split("#")[0] / "index.html").resolve().is_file())

    def test_landing_links_to_all_nine_existing_modules(self):
        elements = Elements((ROOT / "index.html").read_text(encoding="utf-8")).elements
        links = [attrs["href"] for tag, attrs in elements if tag == "a"
                 and attrs.get("href", "").startswith("./gt360/?modulo=")]
        self.assertEqual(len(links), 9)
        self.assertEqual(len(set(links)), 9)
        for link in links:
            module = link.split("=", 1)[1]
            self.assertTrue((ROOT / "gt360" / "modules" / (module + ".html")).is_file(), module)

    def test_documents_distinguish_public_demo_from_internal_project(self):
        for path in ("README.md", "gt360/README.md", "eu-horizonte-intranet/README.md"):
            content = (ROOT / path).read_text(encoding="utf-8")
            self.assertIn("demoStore", content)
            self.assertIn("fictícios", content)
            self.assertIn("Tecnologia", content)
        self.assertIn("não possui", (ROOT / "gt360/README.md").read_text(encoding="utf-8"))

if __name__ == "__main__":
    unittest.main()
