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

    def test_professional_content_is_retained(self):
        content = (ROOT / "index.html").read_text(encoding="utf-8")
        elements = Elements(content).elements
        def count_class(name):
            return sum(name in attrs.get("class", "").split() for _, attrs in elements)
        self.assertEqual(count_class("job"), 5)
        self.assertEqual(count_class("education-card"), 4)
        self.assertEqual(count_class("cert"), 16)
        self.assertEqual(count_class("delivery-card"), 6)
        self.assertEqual(count_class("teaching-card"), 4)
        self.assertEqual(count_class("experience-case"), 3)
        self.assertIn("01/2026 — ATUAL", content)
        self.assertIn("Analista Técnico Comportamental — DISC", content)
        self.assertIn("Identidades de projetos, materiais gráficos, comunicados, campanhas de engajamento e bem-estar, e conteúdos de desenvolvimento organizacional.", content)
        self.assertIn("Recrutamento e Seleção, Departamento Pessoal, Benefícios, Treinamento e Desenvolvimento, Implantação e Mapeamento de Processos e Sistemas de Gestão, e Projetos de Recursos Humanos.", content)

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

    def test_documents_distinguish_public_demo_from_internal_project(self):
        for path in ("README.md", "gt360/README.md", "eu-horizonte-intranet/README.md"):
            content = (ROOT / path).read_text(encoding="utf-8")
            self.assertIn("demoStore", content)
            self.assertIn("fictícios", content)
            self.assertIn("Tecnologia", content)
        self.assertIn("não possui", (ROOT / "gt360/README.md").read_text(encoding="utf-8"))

if __name__ == "__main__":
    unittest.main()
