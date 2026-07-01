import { test, expect } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function clickBtn(page: import('@playwright/test').Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click()
}

/**
 * Escribe una expresión usando solo botones de la UI.
 * Más robusto que keyboard.press — no depende del foco.
 * El ^ usa el botón xⁿ que agrega ^(
 */
async function typeExpr(page: import('@playwright/test').Page, expr: string) {
  for (const ch of expr) {
    switch (ch) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        await clickBtn(page, ch); break
      case '.': await clickBtn(page, '.'); break
      case '+': await clickBtn(page, '+'); break
      case '-': await clickBtn(page, '-'); break
      case '*': await clickBtn(page, '×'); break
      case '/': await clickBtn(page, '÷'); break
      case '^': await clickBtn(page, 'xⁿ'); break  // agrega ^(
      case '(': await clickBtn(page, '('); break
      case ')': await clickBtn(page, ')'); break
      case '!': await clickBtn(page, 'n!'); break
    }
  }
}

async function pressEnter(page: import('@playwright/test').Page) {
  await clickBtn(page, '=')
}

// ─── Flujo básico ────────────────────────────────────────────────────────────

test.describe('Flujo básico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('la app carga correctamente', async ({ page }) => {
    await expect(page).toHaveTitle(/calculadora/i)
    await expect(page.getByRole('button', { name: '=' })).toBeVisible()
    await expect(page.getByRole('button', { name: '7' })).toBeVisible()
  })

  test('ingresar expresión y calcular con botones', async ({ page }) => {
    await clickBtn(page, '(')
    await clickBtn(page, '3')
    await clickBtn(page, '+')
    await clickBtn(page, '5')
    await clickBtn(page, ')')
    await clickBtn(page, '×')
    await clickBtn(page, '2')
    await clickBtn(page, '=')
    await expect(page.getByTestId('result')).toHaveText('16')
  })

  test('ingresar expresión con teclado físico', async ({ page }) => {
    await page.keyboard.type('2+2')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('result')).toHaveText('4')
  })

  test('Esc limpia la expresión', async ({ page }) => {
    await clickBtn(page, '3')
    await clickBtn(page, '+')
    await clickBtn(page, '2')
    await clickBtn(page, 'C')
    await expect(page.getByTestId('expression')).toHaveText(/^\s*$/)
  })

  test('botón C limpia la expresión', async ({ page }) => {
    await clickBtn(page, '5')
    await clickBtn(page, '+')
    await clickBtn(page, '3')
    await clickBtn(page, 'C')
    await expect(page.getByTestId('expression')).toHaveText(/^\s*$/)
  })

  test('precedencia de operadores: 10 - 4 / 2 = 8', async ({ page }) => {
    await clickBtn(page, '1')
    await clickBtn(page, '0')
    await clickBtn(page, '-')
    await clickBtn(page, '4')
    await clickBtn(page, '÷')
    await clickBtn(page, '2')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('8')
  })
})

// ─── Flujo trigonométrico ────────────────────────────────────────────────────

test.describe('Flujo trigonométrico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('sin(30) en grados = 0.5', async ({ page }) => {
    await clickBtn(page, 'sin')
    await clickBtn(page, '3')
    await clickBtn(page, '0')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('0.5')
  })

  test('cambiar a radianes y calcular cos(π) = -1', async ({ page }) => {
    await page.getByRole('button', { name: /DEG/i }).click()
    await expect(page.getByRole('button', { name: /RAD/i })).toBeVisible()
    await clickBtn(page, 'cos')
    await clickBtn(page, 'π')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('-1')
  })

  test('tan(45) en grados = 1', async ({ page }) => {
    await clickBtn(page, 'tan')
    await clickBtn(page, '4')
    await clickBtn(page, '5')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('1')
  })
})

// ─── Flujo fracciones ────────────────────────────────────────────────────────

test.describe('Flujo fracciones y toggle decimal/fracción', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('3/4 + 1/2 = 1.25 en modo decimal', async ({ page }) => {
    await clickBtn(page, '3')
    await clickBtn(page, '÷')
    await clickBtn(page, '4')
    await clickBtn(page, '+')
    await clickBtn(page, '1')
    await clickBtn(page, '÷')
    await clickBtn(page, '2')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('1.25')
  })

  test('toggle convierte 0.75 a 3/4', async ({ page }) => {
    await clickBtn(page, '3')
    await clickBtn(page, '÷')
    await clickBtn(page, '4')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('0.75')
    const toggleBtn = page.getByRole('button', { name: /a\/b|dec/i })
    await expect(toggleBtn).toBeVisible()
    await toggleBtn.click()
    await expect(page.getByTestId('result')).toHaveText('3/4')
  })

  test('toggle vuelve a decimal al presionar nuevamente', async ({ page }) => {
    await clickBtn(page, '1')
    await clickBtn(page, '÷')
    await clickBtn(page, '4')
    await pressEnter(page)
    const toggleBtn = page.getByRole('button', { name: /a\/b|dec/i })
    await toggleBtn.click()
    await expect(page.getByTestId('result')).toHaveText('1/4')
    await toggleBtn.click()
    await expect(page.getByTestId('result')).toHaveText('0.25')
  })

  test('π no habilita el toggle de fracción', async ({ page }) => {
    await clickBtn(page, 'π')
    await pressEnter(page)
    await expect(page.getByRole('button', { name: /a\/b|dec/i })).not.toBeVisible()
  })
})

// ─── Flujo memoria ───────────────────────────────────────────────────────────

test.describe('Flujo memoria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('M+ guarda resultado y MR lo recupera en nueva expresión', async ({ page }) => {
    await clickBtn(page, '5')
    await clickBtn(page, '0')
    await pressEnter(page)
    await clickBtn(page, 'M+')
    await expect(page.getByTestId('memory-indicator')).toBeVisible()
    await clickBtn(page, 'C')
    await clickBtn(page, 'MR')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('50')
  })

  test('MC limpia la memoria', async ({ page }) => {
    await clickBtn(page, '4')
    await clickBtn(page, '2')
    await pressEnter(page)
    await clickBtn(page, 'M+')
    await expect(page.getByTestId('memory-indicator')).toBeVisible()
    await clickBtn(page, 'MC')
    await expect(page.getByTestId('memory-indicator')).not.toBeVisible()
  })
})

// ─── Flujo historial ─────────────────────────────────────────────────────────

test.describe('Flujo historial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('las operaciones aparecen en el historial', async ({ page }) => {
    await clickBtn(page, '2')
    await clickBtn(page, '+')
    await clickBtn(page, '2')
    await pressEnter(page)
    await clickBtn(page, 'C')
    await clickBtn(page, '5')
    await clickBtn(page, '×')
    await clickBtn(page, '3')
    await pressEnter(page)
    await expect(page.getByTestId('history-expression').filter({ hasText: '2+2' }).first()).toBeVisible()
    await expect(page.getByTestId('history-expression').filter({ hasText: '5*3' }).first()).toBeVisible()
  })

  test('click en historial carga la expresión', async ({ page }) => {
    await clickBtn(page, '√')
    await clickBtn(page, '1')
    await clickBtn(page, '4')
    await clickBtn(page, '4')
    await clickBtn(page, ')')
    await pressEnter(page)
    await clickBtn(page, 'C')
    await page.getByTestId('history-entry').first().click()
    await expect(page.getByTestId('expression')).toContainText('sqrt(144)')
  })

  test('el historial muestra expresión y resultado', async ({ page }) => {
    await clickBtn(page, '3')
    await clickBtn(page, '×')
    await clickBtn(page, '4')
    await pressEnter(page)
    await expect(page.getByTestId('history-entry').first()).toContainText('12')
  })
})

// ─── Flujo errores ───────────────────────────────────────────────────────────

test.describe('Flujo errores en español', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('división por cero muestra error en español', async ({ page }) => {
    await clickBtn(page, '5')
    await clickBtn(page, '÷')
    await clickBtn(page, '0')
    await pressEnter(page)
    await expect(page.getByTestId('error')).toContainText('División por cero')
  })

  test('expresión incompleta muestra error en español', async ({ page }) => {
    await clickBtn(page, '3')
    await clickBtn(page, '+')
    await pressEnter(page)
    await expect(page.getByTestId('error')).toContainText('Expresión incompleta')
  })

  test('raíz de negativo muestra error en español', async ({ page }) => {
    await clickBtn(page, '√')
    await clickBtn(page, '-')
    await clickBtn(page, '1')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('error')).toContainText('Raíz de número negativo')
  })

  test('escribir después de un error limpia el error', async ({ page }) => {
    await clickBtn(page, '5')
    await clickBtn(page, '÷')
    await clickBtn(page, '0')
    await pressEnter(page)
    await expect(page.getByTestId('error')).toBeVisible()
    await clickBtn(page, '2')
    await expect(page.getByTestId('error')).not.toBeVisible()
  })
})

// ─── Flujo CNBA ──────────────────────────────────────────────────────────────

test.describe('Criterio de aceptación CNBA — potencias, raíces y fracciones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('2^10 = 1024', async ({ page }) => {
    await clickBtn(page, '2')
    await clickBtn(page, 'xⁿ')  // agrega ^(
    await clickBtn(page, '1')
    await clickBtn(page, '0')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('1024')
  })

  test('√144 = 12', async ({ page }) => {
    await clickBtn(page, '√')
    await clickBtn(page, '1')
    await clickBtn(page, '4')
    await clickBtn(page, '4')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('12')
  })

  test('∛27 = 3', async ({ page }) => {
    await clickBtn(page, '∛')
    await clickBtn(page, '2')
    await clickBtn(page, '7')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('3')
  })

  test('(3/4 + 1/2)^2 = 1.5625', async ({ page }) => {
    await clickBtn(page, '(')
    await clickBtn(page, '3')
    await clickBtn(page, '÷')
    await clickBtn(page, '4')
    await clickBtn(page, '+')
    await clickBtn(page, '1')
    await clickBtn(page, '÷')
    await clickBtn(page, '2')
    await clickBtn(page, ')')
    await clickBtn(page, 'x²')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('1.5625')
  })

  test('5! = 120', async ({ page }) => {
    await clickBtn(page, '5')
    await clickBtn(page, 'n!')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('120')
  })

  test('log(100) = 2', async ({ page }) => {
    await clickBtn(page, 'log')
    await clickBtn(page, '1')
    await clickBtn(page, '0')
    await clickBtn(page, '0')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('2')
  })

  test('(2/3)^2 = 4/9 en modo fracción', async ({ page }) => {
    await clickBtn(page, '(')
    await clickBtn(page, '2')
    await clickBtn(page, '÷')
    await clickBtn(page, '3')
    await clickBtn(page, ')')
    await clickBtn(page, 'x²')
    await pressEnter(page)
    const toggleBtn = page.getByRole('button', { name: /a\/b|dec/i })
    await expect(toggleBtn).toBeVisible()
    await toggleBtn.click()
    await expect(page.getByTestId('result')).toHaveText('4/9')
  })

  test('16^(1/4) = 2', async ({ page }) => {
    await clickBtn(page, '1')
    await clickBtn(page, '6')
    await clickBtn(page, 'xⁿ')  // agrega ^(
    await clickBtn(page, '1')
    await clickBtn(page, '÷')
    await clickBtn(page, '4')
    await clickBtn(page, ')')
    await pressEnter(page)
    await expect(page.getByTestId('result')).toHaveText('2')
  })
})
