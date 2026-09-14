import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------
// Fixed deterministic ids for entities with no natural unique business
// key in this schema (Deal, Booking, BookingItem, ContactMessage). Using
// a hardcoded id as the upsert `where` is what makes re-running this
// script idempotent for these models specifically — every other model
// upserts on a real unique field (slug, email, or a composite unique)
// instead, which is preferred where available (see section 34/§ notes).
// ---------------------------------------------------------------------
const IDS = {
  dealDubai: '9c2f3a10-0000-4000-8000-000000000001',
  dealMaldives: '9c2f3a10-0000-4000-8000-000000000002',
  dealIstanbul: '9c2f3a10-0000-4000-8000-000000000003',
  faqPayment: '9c2f3a10-0000-4000-8000-000000000011',
  faqVisa: '9c2f3a10-0000-4000-8000-000000000012',
  faqDates: '9c2f3a10-0000-4000-8000-000000000013',
  faqInsurance: '9c2f3a10-0000-4000-8000-000000000014',
  faqGroups: '9c2f3a10-0000-4000-8000-000000000015',
  bookingDemo: '9c2f3a10-0000-4000-8000-000000000021',
  bookingItemDemo: '9c2f3a10-0000-4000-8000-000000000022',
  contactMessageDemo: '9c2f3a10-0000-4000-8000-000000000031',
};

// A real bcrypt hash of a fixed development-only password, generated at
// seed time. This IS a working credential in your local dev database —
// see backend/README.md's "Seed dev login" section for the actual
// password and an explicit warning not to reuse it anywhere real. Never
// logged, never returned by any API response (the auth controller only
// ever returns an allow-listed safe-user object, never passwordHash).
const DEV_SEED_PASSWORD = 'DevSeedPassword123!';
const DEV_SEED_BCRYPT_COST = 10; // lower than the app's runtime cost (12) — seed speed, not a real login path

async function seedUsers() {
  const usersData = [
    {
      email: 'anora.nazarova@example.test',
      name: 'Анора Назарова',
      role: 'USER',
    },
    {
      email: 'rustam.karimov@example.test',
      name: 'Рустам Каримов',
      role: 'USER',
    },
    {
      email: 'madina.yusupova@example.test',
      name: 'Мадина Юсупова',
      role: 'USER',
    },
    {
      email: 'farrukh.sharipov@example.test',
      name: 'Фаррух Шарипов',
      role: 'USER',
    },
    {
      email: 'admin@farosayr.test',
      name: 'FaroSayr Admin (demo)',
      role: 'ADMIN',
    },
  ];

  const users = {};
  // Hash once, outside the loop — every seed user shares the same known
  // dev password, so there's no reason to pay bcrypt's cost 5 times.
  const passwordHash = await bcrypt.hash(DEV_SEED_PASSWORD, DEV_SEED_BCRYPT_COST);

  for (const u of usersData) {
    const record = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
      },
    });
    users[u.email] = record;
  }
  return users;
}

async function seedDestinations() {
  // Same entities as frontend/src/data/destinations.js — duplicated here
  // deliberately (not imported) since frontend and backend are separate
  // deployable packages; the frontend file itself is untouched.
  const data = [
    {
      slug: 'istanbul',
      name: 'Турция',
      description:
        'Стамбул — город на двух континентах: базары, Босфор и восточное гостеприимство.',
      image:
        'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'dubai',
      name: 'Дубай',
      description: 'Небоскрёбы, роскошные отели и пустыня в двух шагах от океана.',
      image:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'maldives',
      name: 'Мальдивы',
      description: 'Бунгало над водой и бирюзовая лагуна — путешествие мечты для двоих.',
      image:
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'egypt',
      name: 'Египет',
      description: 'Пирамиды Гизы, Красное море и дайвинг среди коралловых рифов.',
      image:
        'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'thailand',
      name: 'Таиланд',
      description: 'Пхукет и Пхи-Пхи: тропические острова, храмы и уличная кухня.',
      image:
        'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'saudi-arabia',
      name: 'Саудовская Аравия',
      description: 'Древние оазисы, дюны Красного моря и современная архитектура Джидды.',
      image:
        'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'russia',
      name: 'Россия',
      description: 'Москва и Санкт-Петербург: имперская архитектура и белые ночи.',
      image:
        'https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=900&q=80',
    },
    {
      slug: 'uzbekistan',
      name: 'Узбекистан',
      description: 'Самарканд и Бухара — жемчужины Великого шёлкового пути.',
      image:
        'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const destinations = {};
  for (const d of data) {
    const record = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description, image: d.image },
      create: d,
    });
    destinations[d.slug] = record;
  }
  return destinations;
}

async function seedTours(destinations) {
  // Same entities as frontend/src/data/tours.js.
  const data = [
    {
      slug: 'dubai-desert-skyline',
      title: 'Роскошь пустыни и небоскрёбов',
      description: 'Сафари на джипах, смотровая Burj Khalifa, шоппинг в Dubai Mall.',
      duration: '7 дней / 6 ночей',
      location: 'Дубай, ОАЭ',
      price: '899.00',
      destinationSlug: 'dubai',
    },
    {
      slug: 'maldives-lagoon',
      title: 'Романтика бирюзовой лагуны',
      description:
        'Виллы на воде, snorkeling с морскими черепахами, спа-программа для двоих.',
      duration: '5 дней / 4 ночи',
      location: 'Мальдивы',
      price: '1549.00',
      destinationSlug: 'maldives',
    },
    {
      slug: 'egypt-pyramids-sea',
      title: 'Пирамиды и Красное море',
      description: 'Экскурсия в Гизу, дайвинг-сафари, вечерний ужин на яхте по Нилу.',
      duration: '6 дней / 5 ночей',
      location: 'Хургада, Египет',
      price: '429.00',
      destinationSlug: 'egypt',
    },
    {
      slug: 'thailand-islands-asia',
      title: 'Острова, храмы и вкус Азии',
      description:
        'Экскурсия на острова Пхи-Пхи, тайский массаж, кулинарный мастер-класс.',
      duration: '8 дней / 7 ночей',
      location: 'Пхукет, Таиланд',
      price: '699.00',
      destinationSlug: 'thailand',
    },
  ];

  const tours = {};
  for (const t of data) {
    const destination = destinations[t.destinationSlug];
    if (!destination) {
      throw new Error(`Seed integrity error: tour "${t.slug}" references unknown destination "${t.destinationSlug}"`);
    }
    const record = await prisma.tour.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        duration: t.duration,
        location: t.location,
        price: t.price,
        destinationId: destination.id,
        isFeatured: true,
      },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        duration: t.duration,
        location: t.location,
        price: t.price,
        destinationId: destination.id,
        isFeatured: true,
      },
    });
    tours[t.slug] = record;
  }
  return tours;
}

async function seedTourImages(tours) {
  // One representative image per tour, reusing each tour's own frontend
  // card image as image #1 — TourImage has no unique field of its own, so
  // idempotency here relies on upserting by a deterministic composite we
  // construct from (tourId, sortOrder) via findFirst+create/update rather
  // than a schema-level unique constraint, since the spec's minimal
  // TourImage field list didn't include one.
  const images = {
    'dubai-desert-skyline':
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80',
    'maldives-lagoon':
      'https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&w=900&q=80',
    'egypt-pyramids-sea':
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80',
    'thailand-islands-asia':
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
  };

  for (const [tourSlug, url] of Object.entries(images)) {
    const tour = tours[tourSlug];
    const existing = await prisma.tourImage.findFirst({
      where: { tourId: tour.id, sortOrder: 0 },
    });
    if (existing) {
      await prisma.tourImage.update({
        where: { id: existing.id },
        data: { url, alt: tour.title },
      });
    } else {
      await prisma.tourImage.create({
        data: { tourId: tour.id, url, alt: tour.title, sortOrder: 0 },
      });
    }
  }
}

async function seedDeals(tours) {
  // Same entities as frontend/src/data/deals.js. The Istanbul deal has no
  // matching seeded tour (the frontend tours list never had an Istanbul
  // tour), so its tourId is deliberately left null — a live demonstration
  // of Deal.tourId being genuinely optional, not just optional on paper.
  const now = new Date();
  const hours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);

  const data = [
    {
      id: IDS.dealDubai,
      title: 'Дубай: 5 звёзд у моря',
      description: '7 ночей, всё включено, перелёт и трансфер в подарок.',
      image:
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
      price: '899.00',
      oldPrice: '1290.00',
      discount: 30,
      endsAt: hours(30),
      tourSlug: 'dubai-desert-skyline',
    },
    {
      id: IDS.dealMaldives,
      title: 'Мальдивы: вилла над водой',
      description: '5 ночей в бунгало, завтрак включён, романтический ужин.',
      image:
        'https://images.unsplash.com/photo-1587473555771-cbf98a80fda6?auto=format&fit=crop&w=900&q=80',
      price: '1549.00',
      oldPrice: '1990.00',
      discount: 22,
      endsAt: hours(18),
      tourSlug: 'maldives-lagoon',
    },
    {
      id: IDS.dealIstanbul,
      title: 'Стамбул: город двух миров',
      description: '4 ночи в центре города, экскурсия по Босфору включена.',
      image:
        'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=900&q=80',
      price: '389.00',
      oldPrice: '520.00',
      discount: 25,
      endsAt: hours(46),
      tourSlug: null,
    },
  ];

  for (const d of data) {
    const tourId = d.tourSlug ? tours[d.tourSlug]?.id ?? null : null;
    const payload = {
      title: d.title,
      description: d.description,
      image: d.image,
      price: d.price,
      oldPrice: d.oldPrice,
      discount: d.discount,
      startsAt: now,
      endsAt: d.endsAt,
      isActive: true,
      tourId,
    };
    await prisma.deal.upsert({
      where: { id: d.id },
      update: payload,
      create: { id: d.id, ...payload },
    });
  }
}

async function seedFaqs() {
  // Same entities as frontend/src/data/faq.js.
  const data = [
    {
      id: IDS.faqPayment,
      sortOrder: 0,
      question: 'Как оплатить тур?',
      answer:
        'Вы можете оплатить картой онлайн, банковским переводом или наличными в офисе в Душанбе. Рассрочка доступна для туров от $500.',
    },
    {
      id: IDS.faqVisa,
      sortOrder: 1,
      question: 'Нужна ли виза для выбранного направления?',
      answer:
        'Мы проверяем визовые требования для каждого направления и, при необходимости, помогаем подготовить документы или оформляем визу под ключ.',
    },
    {
      id: IDS.faqDates,
      sortOrder: 2,
      question: 'Можно ли изменить даты после бронирования?',
      answer:
        'Да, изменение дат возможно в зависимости от условий тарифа отеля и авиакомпании. Менеджер сообщит о возможных условиях до подтверждения.',
    },
    {
      id: IDS.faqInsurance,
      sortOrder: 3,
      question: 'Включена ли страховка в стоимость тура?',
      answer:
        'Базовая медицинская страховка включена во все туры FaroSair. Расширенное покрытие можно добавить при оформлении заказа.',
    },
    {
      id: IDS.faqGroups,
      sortOrder: 4,
      question: 'Работаете ли вы с групповыми поездками?',
      answer:
        'Да, мы организуем корпоративные поездки, свадебные путешествия и семейные туры для групп от 6 человек со специальными условиями.',
    },
  ];

  for (const f of data) {
    const payload = {
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      isActive: true,
    };
    await prisma.fAQ.upsert({
      where: { id: f.id },
      update: payload,
      create: { id: f.id, ...payload },
    });
  }
}

async function seedReviews(users, tours) {
  // Same review text/authors as frontend/src/data/reviews.js, now attached
  // to real seeded users and one tour each (the original frontend reviews
  // were generic testimonials with no tour reference — assigning one here
  // is a seed-layer decision, not a frontend data change).
  const data = [
    {
      userEmail: 'anora.nazarova@example.test',
      tourSlug: 'dubai-desert-skyline',
      rating: 5,
      comment:
        'Организация была на высшем уровне: отель, трансфер и экскурсии — всё точно, как обещали. Менеджер отвечал даже поздно вечером.',
    },
    {
      userEmail: 'rustam.karimov@example.test',
      tourSlug: 'maldives-lagoon',
      rating: 5,
      comment:
        'Летали на Мальдивы по подсказке FaroSair — маршрут выбрали идеально под наш бюджет. Обязательно вернёмся снова.',
    },
    {
      userEmail: 'madina.yusupova@example.test',
      tourSlug: 'egypt-pyramids-sea',
      rating: 5,
      comment:
        'Впервые путешествовали с ребёнком — и всё прошло гладко благодаря заботе команды FaroSair. Спасибо за спокойствие в поездке!',
    },
    {
      userEmail: 'farrukh.sharipov@example.test',
      tourSlug: 'thailand-islands-asia',
      rating: 5,
      comment:
        'Быстро подобрали тур в Стамбул буквально за два дня до вылета. Цена приятно удивила, сервис — на уровне.',
    },
  ];

  for (const r of data) {
    const user = users[r.userEmail];
    const tour = tours[r.tourSlug];
    if (!user || !tour) {
      throw new Error(`Seed integrity error: review references unknown user/tour (${r.userEmail} / ${r.tourSlug})`);
    }
    await prisma.review.upsert({
      where: { userId_tourId: { userId: user.id, tourId: tour.id } },
      update: { rating: r.rating, comment: r.comment },
      create: { userId: user.id, tourId: tour.id, rating: r.rating, comment: r.comment },
    });
  }
}

async function seedFavorites(users, tours) {
  const data = [
    { userEmail: 'anora.nazarova@example.test', tourSlug: 'maldives-lagoon' },
    { userEmail: 'rustam.karimov@example.test', tourSlug: 'dubai-desert-skyline' },
  ];

  for (const f of data) {
    const user = users[f.userEmail];
    const tour = tours[f.tourSlug];
    if (!user || !tour) {
      throw new Error(`Seed integrity error: favorite references unknown user/tour (${f.userEmail} / ${f.tourSlug})`);
    }
    await prisma.favorite.upsert({
      where: { userId_tourId: { userId: user.id, tourId: tour.id } },
      update: {},
      create: { userId: user.id, tourId: tour.id },
    });
  }
}

async function seedBookingWithItem(users, tours) {
  // One demo booking with one line item, to exercise the
  // Booking -> BookingItem -> Tour relation chain end to end.
  const user = users['farrukh.sharipov@example.test'];
  const tour = tours['dubai-desert-skyline'];
  const quantity = 2;
  const unitPrice = tour.price; // price "at time of purchase" — copied, not referenced live
  const totalPrice = Number(unitPrice) * quantity;

  await prisma.booking.upsert({
    where: { id: IDS.bookingDemo },
    update: {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      totalAmount: totalPrice.toFixed(2),
      userId: user.id,
    },
    create: {
      id: IDS.bookingDemo,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      totalAmount: totalPrice.toFixed(2),
      userId: user.id,
    },
  });

  await prisma.bookingItem.upsert({
    where: { id: IDS.bookingItemDemo },
    update: {
      bookingId: IDS.bookingDemo,
      tourId: tour.id,
      quantity,
      unitPrice,
      totalPrice: totalPrice.toFixed(2),
    },
    create: {
      id: IDS.bookingItemDemo,
      bookingId: IDS.bookingDemo,
      tourId: tour.id,
      quantity,
      unitPrice,
      totalPrice: totalPrice.toFixed(2),
    },
  });
}

async function seedContactMessage() {
  await prisma.contactMessage.upsert({
    where: { id: IDS.contactMessageDemo },
    update: {},
    create: {
      id: IDS.contactMessageDemo,
      name: 'Demo Visitor',
      email: 'demo.visitor@example.test',
      subject: 'Вопрос по туру в Дубай',
      message: 'Здравствуйте! Подскажите, пожалуйста, есть ли места на ближайшую дату.',
    },
  });
}

async function seedNewsletterSubscriber() {
  await prisma.newsletterSubscriber.upsert({
    where: { email: 'newsletter.demo@example.test' },
    update: {},
    create: { email: 'newsletter.demo@example.test' },
  });
}

async function main() {
  // Order matches the spec: Users, Destinations, Tours, TourImages, Deals,
  // FAQs, Reviews, Favorites, Bookings, BookingItems, ContactMessages,
  // NewsletterSubscribers — every step only references records created by
  // an earlier step.
  const users = await seedUsers();
  const destinations = await seedDestinations();
  const tours = await seedTours(destinations);
  await seedTourImages(tours);
  await seedDeals(tours);
  await seedFaqs();
  await seedReviews(users, tours);
  await seedFavorites(users, tours);
  await seedBookingWithItem(users, tours);
  await seedContactMessage();
  await seedNewsletterSubscriber();

  console.log('Seed complete:', {
    users: Object.keys(users).length,
    destinations: Object.keys(destinations).length,
    tours: Object.keys(tours).length,
  });
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
