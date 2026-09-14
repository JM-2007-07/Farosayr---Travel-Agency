// Extracted verbatim from the original #deals markup (3 hot-deal cards).
// hours = original data-hours countdown length; still a client-side demo
// countdown per Phase 2 scope (no server-authoritative endsAt yet).
export const DEALS = [
  {
    id: 'dubai-5star-sea',
    hours: 30,
    discountLabel: '-30%',
    title: 'Дубай: 5 звёзд у моря',
    description: '7 ночей, всё включено, перелёт и трансфер в подарок.',
    oldPrice: 1290,
    newPrice: 899,
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'maldives-overwater-villa',
    hours: 18,
    discountLabel: '-22%',
    title: 'Мальдивы: вилла над водой',
    description: '5 ночей в бунгало, завтрак включён, романтический ужин.',
    oldPrice: 1990,
    newPrice: 1549,
    image: 'https://images.unsplash.com/photo-1587473555771-cbf98a80fda6?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'istanbul-two-worlds',
    hours: 46,
    discountLabel: '-25%',
    title: 'Стамбул: город двух миров',
    description: '4 ночи в центре города, экскурсия по Босфору включена.',
    oldPrice: 520,
    newPrice: 389,
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=900&q=80',
  },
];
