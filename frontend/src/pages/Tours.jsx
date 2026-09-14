import { useCallback, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { getTours } from '../services/toursService';
import { getDestinations } from '../services/destinationsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useFavorites } from '../hooks/useFavorites';
import TourCard from '../components/common/TourCard';
import AsyncState from '../components/common/AsyncState';
import './Tours.css';

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'newest', label: 'Сначала новые' },
];

const EMPTY_FILTERS = {
  destination: '',
  minPrice: '',
  maxPrice: '',
  q: '',
  sort: '',
};

export default function Tours() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const { isFavorited, toggleFavorite } = useFavorites();

  const fetchTours = useCallback(() => getTours(filters), [filters]);

  const {
    status,
    data: tours,
    isLoading,
    isError,
  } = useAsyncData(fetchTours, [
    filters.destination,
    filters.minPrice,
    filters.maxPrice,
    filters.q,
    filters.sort,
  ]);

  const { data: destinations } = useAsyncData(getDestinations, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFilters(draft);
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  return (
    <main className="tours-page">
      <section className="tours-hero">
        <div className="container">
          <div className="tours-hero-content">
            

            <p className="eyebrow">Каталог путешествий</p>

            <h1>
              Найдите путешествие,
              <span> которое запомнится</span>
            </h1>

            <p className="tours-hero-description">
              Подберите идеальный тур по направлению, бюджету и вашим
              предпочтениям. Мы позаботимся обо всём остальном.
            </p>
          </div>
        </div>
      </section>

      <section className="tours-content">
        <div className="container">
          <form className="tours-filter-card" onSubmit={handleSubmit}>
            <div className="filter-card-header">
              <div className="filter-title">
                <div className="filter-title-icon">
                  <TuneRoundedIcon />
                </div>

                <div>
                  <span>Поиск путешествия</span>
                  <p>Настройте параметры и найдите подходящий тур</p>
                </div>
              </div>

              <button
                type="button"
                className="filter-reset"
                onClick={handleReset}
              >
                Сбросить
              </button>
            </div>

            <div className="tours-filter-grid">
              <div className="tour-filter-field tour-filter-destination">
                <label htmlFor="destination">
                  <LocationOnOutlinedIcon />
                  Направление
                </label>

                <select
                  id="destination"
                  name="destination"
                  value={draft.destination}
                  onChange={handleChange}
                >
                  <option value="">Любое направление</option>

                  {(destinations ?? []).map((destination) => (
                    <option key={destination.id} value={destination.slug}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tour-filter-field">
                <label htmlFor="minPrice">
                  <AttachMoneyRoundedIcon />
                  Цена от
                </label>

                <div className="filter-input-wrap">
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    min="0"
                    placeholder="0"
                    value={draft.minPrice}
                    onChange={handleChange}
                  />
                  <span>$</span>
                </div>
              </div>

              <div className="tour-filter-field">
                <label htmlFor="maxPrice">
                  <AttachMoneyRoundedIcon />
                  Цена до
                </label>

                <div className="filter-input-wrap">
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    placeholder="Без лимита"
                    value={draft.maxPrice}
                    onChange={handleChange}
                  />
                  <span>$</span>
                </div>
              </div>

              <div className="tour-filter-field">
                <label htmlFor="q">
                  <SearchRoundedIcon />
                  Поиск
                </label>

                <div className="filter-search-wrap">
                  <SearchRoundedIcon />
                  <input
                    type="text"
                    id="q"
                    name="q"
                    placeholder="Название тура..."
                    value={draft.q}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="tour-filter-field">
                <label htmlFor="sort">
                  <SortRoundedIcon />
                  Сортировка
                </label>

                <select
                  id="sort"
                  name="sort"
                  value={draft.sort}
                  onChange={handleChange}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="tours-search-button">
                <SearchRoundedIcon />
                <span>Найти тур</span>
              </button>
            </div>

            <div className="filter-card-footer">
              <div className="filter-footer-info">
                <FilterAltOutlinedIcon />
                <span>
                  Фильтры применяются после нажатия кнопки «Найти»
                </span>
              </div>

              {status === 'success' && (
                <div className="results-counter">
                  Найдено <strong>{tours.length}</strong> туров
                </div>
              )}
            </div>
          </form>

          <div className="tours-list-header">
            <div>
              <span className="tours-list-kicker">Наши предложения</span>
              <h2>Популярные туры</h2>
            </div>

            {status === 'success' && tours.length > 0 && (
              <span className="tours-list-count">
                {tours.length} предложений
              </span>
            )}
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && tours.length === 0}
            emptyLabel="По вашему запросу туров не найдено."
          />

          {status === 'success' && tours.length > 0 && (
            <div className="tours-grid">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  isFavorited={isFavorited(tour.dbId)}
                  onToggleFavorite={toggleFavorite}
                  bookHref={`/booking?tour=${encodeURIComponent(tour.id)}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}