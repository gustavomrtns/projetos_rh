"""Fluxos de planejamento, ações delimitadas e integração com o workspace."""
import unittest
import test_portfolio as infrastructure

DEVICES = infrastructure.DEVICES


class PlanningBrowserTests(unittest.TestCase):
    setUpClass = classmethod(infrastructure.BrowserSmokeTests.setUpClass.__func__)
    tearDownClass = classmethod(infrastructure.BrowserSmokeTests.tearDownClass.__func__)
    _new_page = infrastructure.BrowserSmokeTests._new_page

    def _screen(self, surface, label):
        surface.get_by_role('tab', name=label, exact=True).click()
        self.assertEqual(surface.locator('.process-view:not([hidden])').count(), 1)
        self.assertEqual(surface.get_by_role('tab', name=label, exact=True).get_attribute('aria-selected'), 'true')

    def test_planning_headcount_scenarios(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    page.goto(self.base + '/headcount/')
                    page.locator('#process-shell').wait_for()
                    self.assertEqual(page.get_by_role('tab').count(), 6)
                    self.assertTrue(page.locator('#metrics').is_visible())
                    self.assertFalse(page.locator('#movement').is_visible())
                    self.assertIn('44.636', page.locator('#metrics').inner_text())
                    page.select_option('#scenario', 'CEN_EXP')
                    page.select_option('#month', '2027-04')
                    self.assertIn('60.921', page.locator('#metrics').inner_text())
                    self._screen(page, 'Quadro de posições')
                    self.assertFalse(page.locator('#metrics').is_visible())
                    page.select_option('#unit', 'U002')
                    self.assertEqual(page.locator('#positions tbody tr').count(), 2)
                    page.select_option('#unit', '')
                    page.select_option('#scenario', 'CEN_BASE')
                    self._screen(page, 'Movimentações')
                    self.assertFalse(page.locator('#unit').is_visible())
                    page.select_option('#type', 'ajuste_planejado')
                    page.select_option('#person', 'D003')
                    page.fill('#salary', '4200')
                    self._screen(page, 'Encargos e provisões')
                    self.assertFalse(page.locator('#movement').is_visible())
                    self._screen(page, 'Movimentações')
                    self.assertEqual(page.input_value('#salary'), '4200')
                    page.locator('#movement button[type=submit]').click()
                    self.assertIn('45.089', page.locator('#metrics').text_content())
                    page.locator('#events [data-remove]').click()
                    page.select_option('#type', 'pacote_planejado')
                    page.select_option('#person', 'D003')
                    page.fill('#benefit-share', '1000')
                    page.locator('#movement button[type=submit]').click()
                    self.assertIn('não pode superar', page.locator('#form-message').inner_text())
                    page.fill('#benefit-share', '100')
                    page.locator('#movement button[type=submit]').click()
                    self.assertIn('44.536', page.locator('#metrics').text_content())
                    page.locator('#events [data-remove]').click()
                    self._screen(page, 'Encargos e provisões')
                    page.fill('#cpp', '0')
                    page.locator('#payroll-policy button[type=submit]').click()
                    self.assertNotIn('44.636', page.locator('#metrics').text_content())
                    page.locator('#reset-policy').click()
                    self._screen(page, 'Composição de custos')
                    with page.expect_download() as composition:
                        page.locator('#export-breakdown').click()
                    self.assertIn('composicao', composition.value.suggested_filename)
                    self._screen(page, 'Projeção anual')
                    with page.expect_download() as downloaded:
                        page.locator('#export').click()
                    self.assertTrue(downloaded.value.suggested_filename.endswith('.csv'))
                    self.assertEqual(page.evaluate('localStorage.length'), 0)
                    page.reload()
                    page.locator('#process-shell').wait_for()
                    self.assertEqual(page.get_by_role('tab', name='Projeção anual').get_attribute('aria-selected'), 'true')
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
                    page.locator('#process-shell').wait_for()
                    self.assertEqual(page.get_by_role('tab').count(), 6)
                    self.assertFalse(page.locator('#person').is_visible())
                    self._screen(page, 'Estrutura de cargos')
                    self.assertEqual(page.locator('.job').count(), 10)
                    page.fill('#search', 'sem resultado')
                    self.assertEqual(page.locator('.job').count(), 0)
                    page.fill('#search', '')
                    self._screen(page, 'Acomodação salarial')
                    page.select_option('#person', 'D003')
                    page.select_option('#target', 'J003')
                    page.fill('#salary', '4200')
                    page.locator('#simulate').click()
                    self.assertIn('Dentro da faixa', page.locator('#placement').inner_text())
                    self.assertIn('452,66', page.locator('#placement').inner_text())
                    self._screen(page, 'Trilhas e competências')
                    self.assertFalse(page.locator('#salary').is_visible())
                    self.assertEqual(page.input_value('#person'), 'D003')
                    self.assertTrue(page.locator('#gaps').is_visible())
                    self._screen(page, 'Acomodação salarial')
                    self.assertEqual(page.input_value('#salary'), '4200')
                    self._screen(page, 'Sucessão')
                    self.assertFalse(page.locator('#development').is_visible())
                    self.assertEqual(page.locator('#nominations .path').count(), 1)
                    page.select_option('#candidate', 'D001')
                    page.fill('#evidence', 'Hipótese de carreira: <script>alert(1)</script>')
                    page.locator('#nomination button[type=submit]').click()
                    self.assertEqual(page.locator('#nominations .path').count(), 2)
                    self.assertIn('<script>', page.locator('#nominations').inner_text())
                    self._screen(page, 'Desenvolvimento')
                    self.assertEqual(page.input_value('#development-person'), 'D001')
                    page.select_option('#development-person', 'D003')
                    self.assertIn('Coordenar projeto piloto', page.locator('#development').inner_text())
                    self.assertFalse(page.locator('#nomination').is_visible())
                    page.reload()
                    page.locator('#process-shell').wait_for()
                    self.assertEqual(page.locator('#nominations .path').count(), 1)
                    self.assertEqual(page.evaluate('localStorage.length'), 0)
                    self.assertFalse(errors, errors)
                    self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), page.viewport_size['width'])
                    page.get_by_role('link', name='Voltar ao portfólio profissional', exact=True).click()
                    page.wait_for_url(self.base + '/#projetos')
                finally:
                    context.close()

    def test_planning_modules_inside_gt360_preserve_forms_and_context(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    page.goto(self.base + '/gt360/?modulo=headcount&tela=movimentacoes')
                    frame = page.frame_locator('#frame-headcount')
                    frame.locator('#process-shell').wait_for()
                    self.assertEqual(frame.get_by_role('tab', name='Movimentações').get_attribute('aria-selected'), 'true')
                    frame.locator('#salary').fill('5100')
                    if device == 'mobile':
                        page.locator('#erp-menu-trigger').click()
                    page.locator('#side-carreira').click()
                    career = page.frame_locator('#frame-carreira')
                    career.locator('#process-shell').wait_for()
                    self.assertFalse(career.locator('body > header').is_visible())
                    self._screen(career, 'Acomodação salarial')
                    career.get_by_role('link', name='Explorar cenário de custos', exact=True).click()
                    page.locator('#frame-headcount.active').wait_for()
                    self.assertEqual(frame.get_by_role('tab', name='Composição de custos').get_attribute('aria-selected'), 'true')
                    self._screen(frame, 'Movimentações')
                    self.assertEqual(frame.locator('#salary').input_value(), '5100')
                    frame.locator('#movement button[type=submit]').click()
                    self.assertEqual(frame.locator('#events [data-remove]').count(), 1)
                    if device == 'mobile':
                        page.locator('#erp-menu-trigger').click()
                    page.locator('#side-home').click()
                    self.assertEqual(page.locator('#home-grid .home-card').count(), 11)
                    if device == 'mobile':
                        page.locator('#erp-menu-trigger').click()
                    page.locator('#side-headcount').click()
                    self.assertEqual(frame.locator('#events [data-remove]').count(), 1)
                    self.assertFalse(errors, errors)
                finally:
                    context.close()

    def test_process_tabs_support_keyboard_and_browser_history(self):
        context, page = self._new_page('desktop')
        try:
            page.goto(self.base + '/carreira/#estrutura')
            page.locator('#process-shell').wait_for()
            tab = page.get_by_role('tab', name='Estrutura de cargos', exact=True)
            self.assertEqual(tab.get_attribute('aria-selected'), 'true')
            tab.focus()
            page.keyboard.press('ArrowRight')
            self.assertEqual(page.get_by_role('tab', name='Trilhas e competências').get_attribute('aria-selected'), 'true')
            page.go_back()
            self.assertEqual(tab.get_attribute('aria-selected'), 'true')
            page.get_by_role('tab', name='Dashboard', exact=True).click()
            page.locator('[data-open-screen="sucessao"]').first.click()
            self.assertEqual(page.get_by_role('tab', name='Sucessão', exact=True).get_attribute('aria-selected'), 'true')
        finally:
            context.close()

    def test_dashboards_refresh_forecasts_and_link_to_actions(self):
        for device in DEVICES:
            with self.subTest(device=device):
                context, page = self._new_page(device)
                try:
                    errors = []
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    page.goto(self.base + '/headcount/?tela=visao-geral')
                    page.locator('#headcount-dashboard').wait_for()
                    self.assertEqual(page.get_by_role('tab', name='Dashboard', exact=True).get_attribute('aria-selected'), 'true')
                    self.assertEqual(page.locator('#budget-outlook').get_attribute('data-first-over'), '')
                    page.select_option('#scenario', 'CEN_EXP')
                    self.assertEqual(page.locator('#budget-outlook').get_attribute('data-first-over'), '2027-04')
                    self.assertIn('690.348,25', page.locator('#budget-outlook').inner_text())
                    page.locator('.dashboard-months [data-dashboard-month="2027-04"]').click()
                    self.assertEqual(page.input_value('#month'), '2027-04')
                    self.assertIn('60.921', page.locator('#metrics').inner_text())
                    page.locator('#metrics [data-open-screen="composicao"]').click()
                    self.assertTrue(page.locator('#breakdown').is_visible())
                    self.assertFalse(page.locator('#headcount-dashboard').is_visible())
                    self._screen(page, 'Dashboard')
                    self.assertEqual(page.input_value('#month'), '2027-04')
                    page.goto(self.base + '/carreira/?tela=dashboard')
                    page.locator('#career-dashboard').wait_for()
                    self.assertEqual(page.locator('.salary-band-row').count(), 5)
                    self.assertIn('1/1', page.locator('#career-metrics').inner_text())
                    page.locator('.salary-band-row[data-dashboard-person="D003"]').click()
                    self.assertEqual(page.input_value('#person'), 'D003')
                    self.assertEqual(page.input_value('#target'), 'J003')
                    self.assertTrue(page.locator('#placement').is_visible())
                    self._screen(page, 'Sucessão')
                    page.locator('#nominations [data-remove]').click()
                    self._screen(page, 'Dashboard')
                    self.assertIn('0/1', page.locator('#career-metrics').inner_text())
                    self.assertIn('sem candidato registrado', page.locator('.dashboard-warning').inner_text())
                    self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), page.viewport_size['width'])
                    self.assertFalse(errors, errors)
                finally:
                    context.close()
