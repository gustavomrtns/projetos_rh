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

    def test_portfolio_editorial_preview_navigation_and_screenshots(self):
        """Regressão da V3: metadados, textos, READMEs e menu mobile."""
        preview_dir = ROOT / "artifacts" / "screenshots"
        preview_dir.mkdir(parents=True, exist_ok=True)
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on("pageerror", lambda exc: errors.append(str(exc)))
                    page.goto(self.base + "/", wait_until="domcontentloaded")
                    self.assertIn("Gestão de Pessoas", page.locator(".hero-specialties").inner_text())
                    self.assertEqual(page.locator(".hero-specialties span").count(), 4)
                    self.assertEqual(page.locator("#projetos .challenge").count(), 2)
                    self.assertEqual(page.locator("#projetos h3").first.inner_text(), "GT360°")
                    self.assertEqual(page.locator('meta[property="og:image"]').count(), 1)
                    self.assertEqual(page.locator('meta[name="twitter:card"]').get_attribute("content"), "summary_large_image")
                    self.assertEqual(
                        page.locator('a[href="https://github.com/gustavomrtns/projetos_rh/blob/main/gt360/README.md"]').count(), 1
                    )
                    self.assertEqual(
                        page.locator('a[href="https://github.com/gustavomrtns/projetos_rh/blob/main/eu-horizonte-intranet/README.md"]').count(), 1
                    )
                    page.screenshot(path=str(preview_dir / f"portfolio-inicio-{device}.png"))
                    if device == "mobile":
                        self.assertLessEqual(float(page.locator(".orb-a").evaluate("(el) => getComputedStyle(el).opacity")), 0.15)
                        button = page.locator("#menuButton")
                        button.click()
                        self.assertEqual(button.get_attribute("aria-expanded"), "true")
                        page.locator('.nav-links a[href="#projetos"]').click()
                        self.assertEqual(button.get_attribute("aria-expanded"), "false")
                    page.locator("#projetos").scroll_into_view_if_needed()
                    # Nas capturas dos cards, ocultar apenas a navegação fixa para não cobrir o recorte.
                    # O site real permanece com cabeçalho e botão de retorno ao topo.
                    page.add_style_tag(content="nav,.back-top,.scroll-progress{visibility:hidden!important}")
                    for idx, name in enumerate(("gt360", "eu-horizonte"), start=1):
                        page.locator("#projetos .project-card").nth(idx - 1).screenshot(
                            path=str(preview_dir / f"card-{name}-{device}.png"),
                            animations="disabled",
                            timeout=12000,
                        )
                    self.assertFalse(errors, f"Erros JavaScript no portfólio ({device}): {errors[:3]}")
                finally:
                    context.close()

    def test_editorial_images_are_framed_without_crop(self):
        """Capas dos dois flagships respeitam margens, proporção e centralização."""
        (ROOT / "artifacts/screenshots").mkdir(parents=True, exist_ok=True)
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    page.goto(self.base + "/", wait_until="domcontentloaded")
                    page.locator("#projetos").scroll_into_view_if_needed()
                    page.wait_for_function(
                        "() => [...document.querySelectorAll('#projetos .project-visual img')]"
                        ".every(im => im.complete && im.naturalWidth > 0)"
                    )
                    visuals = page.locator("#projetos .project-visual")
                    for idx, minimum_padding in enumerate((12, 18)):
                        card = visuals.nth(idx)
                        measurements = card.evaluate("""el => {
                            const img = el.querySelector('img');
                            const frame = el.getBoundingClientRect();
                            const picture = img.getBoundingClientRect();
                            const style = getComputedStyle(img);
                            const box = getComputedStyle(el);
                            return {
                              fit: style.objectFit, transform: style.transform,
                              padLeft: parseFloat(box.paddingLeft), padRight: parseFloat(box.paddingRight),
                              frameW: frame.width, imgW: picture.width,
                              frameH: frame.height, imgH: picture.height,
                              centeredX: Math.abs((picture.left + picture.right)/2 - (frame.left+frame.right)/2)
                            };
                        }""")
                        self.assertEqual(measurements["fit"], "contain")
                        self.assertEqual(measurements["transform"], "none")
                        self.assertGreaterEqual(measurements["padLeft"], minimum_padding)
                        self.assertGreaterEqual(measurements["padRight"], minimum_padding)
                        self.assertLessEqual(measurements["imgW"], measurements["frameW"] - 2 * minimum_padding + 1)
                        self.assertLessEqual(measurements["imgH"], measurements["frameH"] + 1)
                        self.assertLess(measurements["centeredX"], 2)
                    page.locator("#projetos .project-card").first.screenshot(
                        path=str(ROOT / "artifacts/screenshots" / f"card-gt360-{device}.png"),
                        animations="disabled",
                    )
                    page.locator("#projetos .project-card").nth(1).screenshot(
                        path=str(ROOT / "artifacts/screenshots" / f"card-eu-horizonte-{device}.png"),
                        animations="disabled",
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
