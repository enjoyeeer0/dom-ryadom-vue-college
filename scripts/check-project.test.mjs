import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse, compileScript } from '@vue/compiler-sfc'

// Проверяем настоящую логику App.vue без установки отдельного тестового фреймворка.
const source = await readFile(new URL('../src/App.vue', import.meta.url), 'utf8')
const dataSource = await readFile(new URL('../src/data/listings.js', import.meta.url), 'utf8')
const parsedData = await readFile(new URL('../src/data/parsed-listings.json', import.meta.url), 'utf8')
const dataModule = `data:text/javascript;base64,${Buffer.from(dataSource.replace("import parsedListings from './parsed-listings.json'", `const parsedListings = ${parsedData}`)).toString('base64')}`
const { listings } = await import(dataModule)
const { descriptor } = parse(source)
const compiled = compileScript(descriptor, { id: 'check-project' }).content
  .replace("from 'vue'", `from '${import.meta.resolve('vue')}'`)
  .replace("from './data/listings.js'", `from '${dataModule}'`)
const { default: App } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const setup = () => App.setup({}, { expose() {} })

test('Поиск, совместные фильтры, сброс и избранное', () => {
  const app = setup()
  app.searchText.value = '  СВЕТЛАЯ  '
  assert.equal(app.filteredListings.value.length, 1)
  app.resetFilters()
  app.districtFilter.value = 'Северный'
  app.roomsFilter.value = '2'
  app.maxPrice.value = '47000'
  assert.deepEqual(app.filteredListings.value.map(item => item.id), [5])
  app.maxPrice.value = '46999'
  assert.equal(app.filteredListings.value.length, 0)
  app.resetFilters()
  app.toggleFavorite(5)
  app.showFavorites.value = true
  assert.deepEqual(app.filteredListings.value.map(item => item.id), [5])
  app.toggleFavorite(5)
  assert.equal(app.filteredListings.value.length, 0)
})

test('Объявление без цены видно без фильтра, но оно не считается бесплатным', () => {
  const item = { id: 'missing-fields' }
  listings.push(item)
  try {
    const app = setup()
    assert.ok(app.filteredListings.value.includes(item))
    app.maxPrice.value = '40000'
    assert.ok(!app.filteredListings.value.includes(item))
  } finally {
    listings.pop()
  }
})
