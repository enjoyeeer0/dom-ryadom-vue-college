import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const sourcePath = resolve('sample-listings.html')
const outputPath = resolve('src/data/parsed-listings.json')
const html = await readFile(sourcePath, 'utf8')
const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]

if (jsonLdBlocks.length === 0) {
  throw new Error(`В файле ${sourcePath} не найдены блоки JSON-LD`)
}

function getListings(value) {
  if (Array.isArray(value)) return value.flatMap(getListings)
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value['@graph'])) return value['@graph'].flatMap(getListings)

  const type = value['@type']
  const isApartment = (Array.isArray(type) ? type : [type]).some((item) =>
    ['Apartment', 'House', 'Residence', 'Accommodation'].includes(item),
  )

  return isApartment ? [value] : []
}

const parsed = jsonLdBlocks.flatMap(([, block]) => getListings(JSON.parse(block)))
const normalized = parsed.map((item, index) => {
  const address = item.address || {}
  const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers || {}
  const area = item.floorSize?.value ?? item.floorSize

  return {
    id: index + 1,
    title: item.name || '',
    price: Number(offer.price) || null,
    district: address.addressLocality || address.addressRegion || '',
    rooms: Number(item.numberOfRooms) || null,
    area: Number(area) || null,
    description: item.description || '',
    image: Array.isArray(item.image) ? item.image[0] : item.image || '',
    address: address.streetAddress || '',
  }
})

if (normalized.length === 0) {
  throw new Error(`В файле ${sourcePath} не найдено объявлений с подходящим типом`)
}

await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
console.log(`Готово: извлечено объявлений — ${normalized.length}. Файл: ${outputPath}`)
