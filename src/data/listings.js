import parsedListings from './parsed-listings.json'

export const listings = [
  ...parsedListings,
  {
    id: 4,
    title: 'Небольшая квартира у метро',
    price: 41000,
    district: 'Восточный',
    rooms: 1,
    area: 38,
    description:
      'До метро пять минут пешком. В квартире тихо, окна выходят во двор. Подойдёт для спокойной жизни.',
    image: '/photos/room-4.jpg',
    address: 'ул. Строителей, 4',
  },
  {
    id: 5,
    title: 'Двухкомнатная квартира с балконом',
    price: 47000,
    district: 'Северный',
    rooms: 2,
    area: 49,
    description:
      'Аккуратная квартира с застеклённым балконом и местом для хранения. Кухня полностью оборудована.',
    image: '/photos/room-5.jpg',
    address: 'ул. Берёзовая, 17',
  },
  {
    id: 6,
    title: 'Уютная квартира в тихом районе',
    price: 39000,
    district: 'Западный',
    rooms: 2,
    area: 45,
    description:
      'Спокойный район и приятные соседи. В квартире есть всё необходимое для комфортного проживания.',
    image: '/photos/room-6.jpg',
    address: 'ул. Цветочная, 3',
  },
  {
    id: 7,
    title: 'Квартира с видом на город',
    price: 59000,
    district: 'Центральный',
    rooms: 2,
    area: 58,
    description:
      'Светлая квартира на высоком этаже. Рядом кафе, остановки и набережная. Есть посудомоечная машина.',
    image: '/photos/room-7.jpg',
    address: 'наб. Речная, 10',
  },
  {
    id: 8,
    title: 'Простая студия с мебелью',
    price: 29000,
    district: 'Восточный',
    rooms: 1,
    area: 27,
    description: 'Небольшая квартира с мебелью. Рядом остановка общественного транспорта.',
    image: '/photos/room-2.jpg',
    address: 'ул. Новая, 6',
  },
]
