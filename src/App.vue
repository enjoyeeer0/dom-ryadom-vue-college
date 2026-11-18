<script setup>
import { computed, ref } from 'vue'
import { listings } from './data/listings.js'

const searchText = ref('')
const districtFilter = ref('')
const roomsFilter = ref('')
const maxPrice = ref('')
const favorites = ref([])
const showFavorites = ref(false)
const selectedListing = ref(null)

const districts = computed(() => [...new Set(listings.map((item) => item.district).filter(Boolean))])

const filteredListings = computed(() => {
  const search = searchText.value.trim().toLocaleLowerCase('ru')
  const priceLimit = maxPrice.value === '' ? null : Number(maxPrice.value)

  return listings.filter((item) => {
    const matchesSearch = !search || (item.title || '').toLocaleLowerCase('ru').includes(search)
    const matchesDistrict = !districtFilter.value || item.district === districtFilter.value
    const matchesRooms = !roomsFilter.value || String(item.rooms) === roomsFilter.value
    const matchesPrice = priceLimit === null || (
      item.price != null && item.price !== '' &&
      Number.isFinite(Number(item.price)) && Number(item.price) >= 0 && Number(item.price) <= priceLimit
    )
    const matchesFavorites = !showFavorites.value || favorites.value.includes(item.id)

    return matchesSearch && matchesDistrict && matchesRooms && matchesPrice && matchesFavorites
  })
})

function toggleFavorite(id) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((favoriteId) => favoriteId !== id)
    : [...favorites.value, id]
}

function resetFilters() {
  searchText.value = ''
  districtFilter.value = ''
  roomsFilter.value = ''
  maxPrice.value = ''
  showFavorites.value = false
}

function formatPrice(price) {
  return Number(price).toLocaleString('ru-RU')
}

function closeOnBackdrop(event) {
  if (event.target === event.currentTarget) selectedListing.value = null
}
</script>

<template>
  <div class="page-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Дом рядом — на главную" @click.prevent="resetFilters">
        <span class="brand-mark">⌂</span>
        <span>дом<span class="brand-light">рядом</span></span>
      </a>
      <nav class="top-nav" aria-label="Основная навигация">
        <a class="nav-link" :class="{ active: !showFavorites }" href="#listings" @click="showFavorites = false">Аренда</a>
        <button
          class="nav-favorites"
          :class="{ 'nav-favorites-active': showFavorites }"
          type="button"
          @click="showFavorites = !showFavorites"
        >
          <span aria-hidden="true">♡</span>
          Избранное
          <span v-if="favorites.length" class="favorite-count">{{ favorites.length }}</span>
        </button>
      </nav>
      <div class="header-note"><span class="online-dot"></span>Подберём место для жизни</div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> Аренда без лишних хлопот</p>
          <h1>Найдите место,<br />которое станет <em>домом</em></h1>
          <p class="hero-description">
            Уютные квартиры для вашего следующего этапа жизни. Смотрите, выбирайте, сохраняйте.
          </p>
          <a class="hero-action" href="#listings">Смотреть объявления <span>↓</span></a>
        </div>
        <div class="hero-photo">
          <div class="hero-photo-overlay"></div>
          <div class="hero-tag"><span>✦</span> Место для вашей истории</div>
          <div class="hero-caption">Хороший дом начинается с хорошего выбора.</div>
        </div>
        <div class="hero-number">01 <span>/ 08</span></div>
      </section>

      <section id="listings" class="listings-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow section-eyebrow">Варианты для вас</p>
            <h2>{{ showFavorites ? 'Избранное' : 'Объявления' }}<span class="heading-dot">.</span></h2>
          </div>
          <p class="results-count">
            Найдено <strong>{{ filteredListings.length }}</strong>
            {{ filteredListings.length === 1 ? 'объявление' : filteredListings.length > 1 && filteredListings.length < 5 ? 'объявления' : 'объявлений' }}
          </p>
        </div>

        <div class="filters" aria-label="Поиск и фильтры">
          <label class="search-control">
            <span class="control-icon" aria-hidden="true">⌕</span>
            <input v-model="searchText" type="search" aria-label="Поиск по названию" placeholder="Например, «светлая квартира»" />
          </label>
          <label class="filter-control">
            <span class="filter-label">Район</span>
            <select v-model="districtFilter" aria-label="Выберите район">
              <option value="">Любой</option>
              <option v-for="district in districts" :key="district" :value="district">{{ district }}</option>
            </select>
          </label>
          <label class="filter-control">
            <span class="filter-label">Комнаты</span>
            <select v-model="roomsFilter" aria-label="Количество комнат">
              <option value="">Любое</option>
              <option value="1">1 комната</option>
              <option value="2">2 комнаты</option>
              <option value="3">3 комнаты</option>
            </select>
          </label>
          <label class="filter-control price-control">
            <span class="filter-label">Цена до, ₽/мес.</span>
            <input v-model="maxPrice" type="number" min="0" placeholder="Без ограничений" />
          </label>
          <button class="filter-reset" type="button" @click="resetFilters">Сбросить</button>
        </div>

        <div v-if="filteredListings.length" class="listing-grid">
          <article v-for="(listing, index) in filteredListings" :key="listing.id" class="listing-card">
            <button
              class="listing-image"
              type="button"
              :aria-label="`Посмотреть объявление: ${listing.title || 'Без названия'}`"
              @click="selectedListing = listing"
            >
              <img
                v-if="listing.image"
                :src="listing.image"
                :alt="listing.title || 'Фотография жилья'"
                loading="lazy"
                @error="$event.target.style.display = 'none'"
              />
              <span v-else class="image-placeholder">⌂</span>
              <span class="image-number">{{ String(index + 1).padStart(2, '0') }}</span>
            </button>
            <button
              class="favorite-button"
              :class="{ favorited: favorites.includes(listing.id) }"
              type="button"
              :aria-label="favorites.includes(listing.id) ? 'Убрать из избранного' : 'Добавить в избранное'"
              @click="toggleFavorite(listing.id)"
            >
              {{ favorites.includes(listing.id) ? '♥' : '♡' }}
            </button>
            <div class="listing-content">
              <div class="card-location"><span>⌖</span>{{ listing.district || 'Район не указан' }}</div>
              <button class="listing-title" type="button" @click="selectedListing = listing">
                {{ listing.title || 'Название не указано' }}
              </button>
              <p class="listing-address">{{ listing.address || 'Адрес не указан' }}</p>
              <div class="listing-meta">
                <span>{{ listing.rooms ? `${listing.rooms} комн.` : 'Комнаты не указаны' }}</span>
                <span class="meta-separator"></span>
                <span>{{ listing.area ? `${listing.area} м²` : 'Площадь не указана' }}</span>
              </div>
              <div class="card-bottom">
                <p class="listing-price">
                  {{ listing.price ? `${formatPrice(listing.price)} ₽` : 'Цена не указана' }}
                  <span v-if="listing.price">/ месяц</span>
                </p>
                <button class="details-link" type="button" @click="selectedListing = listing" aria-label="Подробнее">
                  ↗
                </button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <span class="empty-icon">⌂</span>
          <h3>{{ showFavorites && favorites.length === 0 ? 'Пока ничего не сохранено' : 'Ничего не нашлось' }}</h3>
          <p>
            {{
              showFavorites && favorites.length === 0
                ? 'Нажмите на сердечко у понравившегося объявления — оно появится здесь.'
                : 'Попробуйте изменить запрос или сбросить фильтры.'
            }}
          </p>
          <button type="button" @click="resetFilters">Показать все объявления</button>
        </div>
      </section>
    </main>

    <footer class="footer">
      <a class="brand footer-brand" href="#" @click.prevent="resetFilters">
        <span class="brand-mark">⌂</span><span>дом<span class="brand-light">рядом</span></span>
      </a>
      <p>Ваше новое место начинается здесь.</p>
      <span class="footer-year">Учебный проект · 2026</span>
    </footer>

    <div v-if="selectedListing" class="modal-backdrop" @click="closeOnBackdrop">
      <section class="listing-modal" role="dialog" aria-modal="true" :aria-label="selectedListing.title || 'Объявление'">
        <button class="modal-close" type="button" aria-label="Закрыть" @click="selectedListing = null">×</button>
        <div class="modal-image">
          <img
            v-if="selectedListing.image"
            :src="selectedListing.image"
            :alt="selectedListing.title || 'Фотография жилья'"
            @error="$event.target.style.display = 'none'"
          />
          <span v-else class="image-placeholder">⌂</span>
        </div>
        <div class="modal-content">
          <p class="eyebrow section-eyebrow">{{ selectedListing.district || 'Район не указан' }}</p>
          <h2>{{ selectedListing.title || 'Название не указано' }}</h2>
          <p class="modal-price">
            {{ selectedListing.price ? `${formatPrice(selectedListing.price)} ₽` : 'Цена не указана' }}
            <span v-if="selectedListing.price">/ месяц</span>
          </p>
          <div class="modal-facts">
            <div><span>Комнаты</span><strong>{{ selectedListing.rooms || 'Не указано' }}</strong></div>
            <div><span>Площадь</span><strong>{{ selectedListing.area ? `${selectedListing.area} м²` : 'Не указана' }}</strong></div>
            <div><span>Адрес</span><strong>{{ selectedListing.address || 'Не указан' }}</strong></div>
          </div>
          <h3>Об объявлении</h3>
          <p class="modal-description">{{ selectedListing.description || 'Описание не добавлено.' }}</p>
          <button
            class="modal-favorite"
            type="button"
            @click="toggleFavorite(selectedListing.id)"
          >
            {{ favorites.includes(selectedListing.id) ? '♥ В избранном' : '♡ Добавить в избранное' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
