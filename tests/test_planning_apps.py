"""Fluxos de planejamento no mesmo servidor de testes do portfólio."""
import unittest
import test_portfolio as infrastructure

DEVICES = infrastructure.DEVICES


class PlanningBrowserTests(unittest.TestCase):
    setUpClass = classmethod(infrastructure.BrowserSmokeTests.setUpClass.__func__)
    tearDownClass = classmethod(infrastructure.BrowserSmokeTests.tearDownClass.__func__)
    _new_page = infrastructure.BrowserSmokeTests._new_page
    def test_planning_headcount_scenarios(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    page.goto(self.base + '/headcount/')
                    page.locator('#scenario').wait_for()
                    self.assertIn('39.080', page.locator('#metrics').inner_text())
                    page.select_option('#scenario', 'CEN_EXP')
                    page.select_option('#month', '2027-04')
                    self.assertIn('53.360', page.locator('#metrics').inner_text())
                    page.select_option('#unit', 'U002')
                    self.assertEqual(page.locator('#positions tbody tr').count(), 2)
                    page.select_option('#unit', '')
                    page.select_option('#scenario', 'CEN_BASE')
                    page.select_option('#type', 'ajuste_planejado')
                    page.select_option('#person', 'D003')
                    page.fill('#salary', '4200')
                    page.locator('#movement button[type=submit]').click()
                    self.assertIn('39.470', page.locator('#metrics').inner_text())
                    page.locator('#events [data-remove]').click()
                    self.assertIn('39.080', page.locator('#metrics').inner_text())
                    with page.expect_download() as downloaded:
                        page.locator('#export').click()
                    self.assertTrue(downloaded.value.suggested_filename.endswith('.csv'))
                    self.assertEqual(page.evaluate('localStorage.length'), 0)
                    page.reload()
                    page.locator('#scenario').wait_for()
                    self.assertEqual(page.locator('#events [data-remove]').count(), 0)
                    self.assertFalse(errors, errors)
                    self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), page.viewport_size['width'])
                finally:
                    context.close()

    def test_planning_career_and_succession(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    page.goto(self.base + '/carreira/')
                    page.locator('#family').wait_for()
                    self.assertEqual(page.locator('.job').count(), 10)
                    page.fill('#search', 'sem resultado')
                    self.assertEqual(page.locator('.job').count(), 0)
                    page.fill('#search', '')
                    page.select_option('#person', 'D003')
                    page.select_option('#target', 'J003')
                    page.fill('#salary', '4200')
                    page.locator('#simulate').click()
                    self.assertIn('Dentro da faixa', page.locator('#placement').inner_text())
                    self.assertIn('390,00', page.locator('#placement').inner_text())
                    self.assertEqual(page.locator('#nominations .path').count(), 1)
                    page.select_option('#candidate', 'D001')
                    page.fill('#evidence', 'Hipótese fictícia: <script>alert(1)</script>')
                    page.locator('#nomination button[type=submit]').click()
                    self.assertEqual(page.locator('#nominations .path').count(), 2)
                    self.assertIn('<script>', page.locator('#nominations').inner_text())
                    page.reload()
                    page.locator('#family').wait_for()
                    self.assertEqual(page.locator('#nominations .path').count(), 1)
                    self.assertEqual(page.evaluate('localStorage.length'), 0)
                    self.assertFalse(errors, errors)
                    self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), page.viewport_size['width'])
                    page.get_by_role('link', name='Voltar ao portfólio profissional', exact=True).click()
                    page.wait_for_url(self.base + '/#projetos')
                finally:
                    context.close()
