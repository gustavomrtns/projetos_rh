"""Testes de fumaça: portfólio, GT360° e eu + horizonte (desktop/mobile).

Executar na raiz do repositório: python -m unittest discover -s tests -v
Requer playwright e o navegador Chromium.
Não modifica os dados ou os arquivos das aplicações.
"""
from __future__ import annotations

import functools
import re
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MODULES = (
    "onboarding",
    "avaliacao-clt",
    "avaliacao-pj",
    "tempo-casa",
    "desligamento",
    "engajamento",
    "riscos-psicossociais",
    "treinamentos",
    "checklist-5s",
)
DEVICES = {
    "desktop": dict(viewport={"width": 1440, "height": 900}, is_mobile=False),
    "mobile": dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2),
}


class _QuietStaticServer(SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass


class DocumentationTests(unittest.TestCase):
    """Guardas de regressão para informações públicas e caminhos do projeto."""

    def test_backup_documentation_matches_memory_only_demo(self):
        root = (ROOT / "README.md").read_text(encoding="utf-8")
        gt = (ROOT / "gt360/README.md").read_text(encoding="utf-8")
        shared = (ROOT / "shared/README.md").read_text(encoding="utf-8")
        eu = (ROOT / "eu-horizonte-intranet/README.md").read_text(encoding="utf-8")
        self.assertIn("demoStore", root)
        self.assertIn("demoStore", gt)
        self.assertIn("memória", gt)
        self.assertIn("não possui", gt)
        self.assertIn("demoStore", shared)
        self.assertIn("demoStore", eu)
        self.assertNotIn("Os botões **Baixar backup** e **Restaurar backup**, no cabeçalho, salvam", gt)
        self.assertNotIn("Workspace de Gestão de Talentos", root)
        self.assertNotIn("Workspace de Gestão de Talentos", gt)

    def test_landing_assets_and_all_nine_module_files_exist(self):
        for relative in (
            "index.html",
            "gt360/index.html",
            "eu-horizonte-intranet/index.html",
            "shared/demo-core.js",
            "gt360/gt360-case-editorial.svg",
            "eu-horizonte-intranet/eu-horizonte-case-editorial.svg",
        ):
            self.assertTrue((ROOT / relative).is_file(), relative)
        for module in MODULES:
            self.assertTrue((ROOT / "gt360" / "modules" / (module + ".html")).is_file(), module)


class BrowserSmokeTests(unittest.TestCase):
    """Percorre os fluxos básicos em um servidor estático local e Chromium real."""

    @classmethod
    def setUpClass(cls):
        handler = functools.partial(_QuietStaticServer, directory=str(ROOT))
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True, args=["--no-sandbox"])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join(timeout=3)

    def _new_page(self, device: str):
        context = self.browser.new_context(
            **DEVICES[device],
            reduced_motion="reduce",
            locale="pt-BR",
            service_workers="block",
        )
        page = context.new_page()
        page.set_default_timeout(12000)
        return context, page

    def test_portfolio_has_two_working_case_links_and_images(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    page.goto(self.base + "/", wait_until="domcontentloaded")
                    page.locator("#projetos").scroll_into_view_if_needed()
                    for href in ("./gt360/", "./eu-horizonte-intranet/"):
                        self.assertEqual(page.locator(f'#projetos a[href="{href}"]').count(), 2, href)
                    page.wait_for_function(
                        "() => [...document.querySelectorAll('#projetos .project-visual img')]"
                        ".length === 2 && [...document.querySelectorAll('#projetos .project-visual img')]"
                        ".every(im => im.complete && im.naturalWidth > 0)"
                    )
                finally:
                    context.close()

    def test_gt360_startup_and_nine_modules(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on("pageerror", lambda exc: errors.append(str(exc)))
                    page.goto(self.base + "/gt360/", wait_until="domcontentloaded")
                    page.locator("#home-view.active").wait_for(state="visible", timeout=20000)
                    page.locator("#boot").wait_for(state="hidden", timeout=20000)
                    self.assertEqual(page.locator("#home-grid .home-card").count(), 9)
                    for module in MODULES:
                        if device == "mobile":
                            page.locator("#erp-menu-trigger").click()
                            page.locator("#sidebar.mobile-open").wait_for(state="visible")
                        page.locator(f"#side-{module}").click()
                        page.locator(f"#frame-{module}.active").wait_for(state="visible")
                        page.wait_for_function(
                            """(id) => {
                              const fr = document.getElementById(id);
                              return !!(fr && fr.getAttribute('src') &&
                                fr.contentDocument &&
                                fr.contentDocument.readyState === 'complete' &&
                                fr.contentDocument.body &&
                                fr.contentDocument.body.children.length);
                            }""",
                            arg="frame-" + module,
                            timeout=20000,
                        )
                    if device == "mobile":
                        page.locator("#erp-menu-trigger").click()
                    page.locator("#side-home").click()
                    page.locator("#home-view.active").wait_for(state="visible")
                    self.assertFalse(errors, f"Exceções JavaScript ({device}): {errors[:3]}")
                finally:
                    context.close()

    def test_eu_horizonte_basic_navigation(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on("pageerror", lambda exc: errors.append(str(exc)))
                    page.goto(self.base + "/eu-horizonte-intranet/", wait_until="domcontentloaded")
                    page.locator("#abertura").wait_for(state="detached", timeout=12000)
                    page.locator("#tela-inicio.ativa").wait_for(state="visible")
                    for tela in ("agenda", "acervo", "inicio"):
                        selector = (
                            f'.eh-desktop-nav [data-acao="tela"][data-valor="{tela}"]'
                            if device == "desktop"
                            else f'.doca [data-acao="tela"][data-valor="{tela}"]'
                        )
                        page.locator(selector).click()
                        page.locator(f"#tela-{tela}.ativa").wait_for(state="visible")
                    self.assertFalse(errors, f"Exceções JavaScript ({device}): {errors[:3]}")
                finally:
                    context.close()

    def test_public_apps_return_to_portfolio(self):
        for device in DEVICES:
            for case_path in ("/gt360/", "/eu-horizonte-intranet/"):
                with self.subTest(device=device, case=case_path):
                    context, page = self._new_page(device)
                    try:
                        page.goto(self.base + case_path, wait_until="domcontentloaded")
                        if case_path == "/gt360/":
                            page.locator("#home-view.active").wait_for(state="visible", timeout=20000)
                        else:
                            page.locator("#abertura").wait_for(state="detached", timeout=12000)
                        link = page.get_by_role("link", name="Voltar ao portfólio profissional", exact=True)
                        self.assertEqual(link.count(), 1)
                        self.assertTrue(link.is_visible())
                        bounds = link.bounding_box()
                        self.assertIsNotNone(bounds)
                        self.assertGreaterEqual(bounds["x"], 0)
                        self.assertLessEqual(bounds["x"] + bounds["width"], page.viewport_size["width"] + 1)
                        link.click()
                        page.wait_for_url(self.base + "/#projetos")
                        self.assertTrue(page.locator("#projetos").is_visible())
                    finally:
                        context.close()

    def test_demo_store_is_memory_only_after_reload(self):
        for case_path in ("/gt360/", "/eu-horizonte-intranet/"):
            with self.subTest(case=case_path):
                context, page = self._new_page("desktop")
                try:
                    page.goto(self.base + case_path, wait_until="domcontentloaded")
                    page.wait_for_function("() => Boolean(window.demoStore)")
                    page.evaluate("() => window.demoStore.setItem('__qa_temporario', 'teste')")
                    self.assertEqual(page.evaluate("() => demoStore.getItem('__qa_temporario')"), "teste")
                    self.assertEqual(
                        page.evaluate("() => Object.keys(window.localStorage).filter(k => k === '__qa_temporario').length"),
                        0,
                    )
                    page.reload(wait_until="domcontentloaded")
                    page.wait_for_function("() => Boolean(window.demoStore)")
                    self.assertIsNone(page.evaluate("() => demoStore.getItem('__qa_temporario')"))
                finally:
                    context.close()


if __name__ == "__main__":
    unittest.main()
