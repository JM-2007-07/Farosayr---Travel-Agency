import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
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
import PageHero from '../components/common/PageHero';
import './Tours.css';
import Seo from '../seo/Seo';

const SORT_OPTIONS = [
  { value: '', labelKey: 'tours.sortOptions.default' },
  { value: 'price_asc', labelKey: 'tours.sortOptions.priceAsc' },
  { value: 'price_desc', labelKey: 'tours.sortOptions.priceDesc' },
  { value: 'newest', labelKey: 'tours.sortOptions.newest' },
];

const EMPTY_FILTERS = {
  destination: '',
  minPrice: '',
  maxPrice: '',
  q: '',
  sort: '',
};

// Applied filters live in the URL (/tours?destination=dubai&maxPrice=1000),
// so a filtered list can be shared, survives a refresh, works with the
// browser's Back button, and the homepage search can link straight to it.
function readFilters(searchParams) {
  return Object.fromEntries(Object.keys(EMPTY_FILTERS).map((key) => [key, searchParams.get(key) ?? '']));
}

function toSearchParams(values, extra = {}) {
  return Object.fromEntries(
    Object.entries({ ...values, ...extra }).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
}

export default function Tours() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterKey = searchParams.toString();
  const filters = useMemo(() => readFilters(searchParams), [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps
  // Travellers chosen in the homepage search — carried into the booking form.
  const travelers = searchParams.get('travelers') ?? '';
  const [draft, setDraft] = useState(filters);
  const { isFavorited, toggleFavorite } = useFavorites();

  // Keep the form in sync when the URL changes (Back button, a new search).
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const fetchTours = useCallback(() => getTours(filters), [filters]);

  const {
    status,
    data: tours,
    isLoading,
    isError,
    reload,
  } = useAsyncData(fetchTours, [filterKey]);

  const { data: destinations } = useAsyncData(getDestinations, []);

  const hasFilters = Object.values(filters).some(Boolean);

  function handleChange(e) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSearchParams(toSearchParams(draft, { travelers }));
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
    setSearchParams({});
  }

  const bookingHref = (tour) => {
    const params = new URLSearchParams({ tour: tour.id });
    if (/^\d{1,2}$/.test(travelers)) params.set('quantity', travelers);
    return `/booking?${params}`;
  };

  return (
    <div className="tours-page">
      <Seo page="tours" path="/tours" />
      <PageHero
        className="tours-hero"
        eyebrow={t('tours.eyebrow')}
        title={<Trans i18nKey="tours.title" components={{ accent: <span /> }} />}
        text={t('tours.text')}
        stacked
      />

      <section className="tours-content">
        <div className="container">
          <form className="tours-filter-card" onSubmit={handleSubmit}>
            <div className="filter-card-header">
              <div className="filter-title">
                <div className="filter-title-icon">
                  <TuneRoundedIcon />
                </div>

                <div>
                  <span>{t('tours.filterTitle')}</span>
                  <p>{t('tours.filterText')}</p>
                </div>
              </div>

              <button
                type="button"
                className="text-link text-link--muted filter-reset"
                onClick={handleReset}
              >
                {t('tours.reset')}
              </button>
            </div>

            <div className="tours-filter-grid">
              <div className="tour-filter-field tour-filter-destination">
                <label htmlFor="destination">
                  <LocationOnOutlinedIcon />
                  {t('common.destination')}
                </label>

                <select
                  id="destination"
                  name="destination"
                  value={draft.destination}
                  onChange={handleChange}
                >
                  <option value="">{t('tours.anyDestination')}</option>

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
                  {t('tours.priceFrom')}
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
                  {t('tours.priceTo')}
                </label>

                <div className="filter-input-wrap">
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    placeholder={t('tours.noLimit')}
                    value={draft.maxPrice}
                    onChange={handleChange}
                  />
                  <span>$</span>
                </div>
              </div>

              <div className="tour-filter-field">
                <label htmlFor="q">
                  <SearchRoundedIcon />
                  {t('tours.search')}
                </label>

                <div className="filter-search-wrap">
                  <SearchRoundedIcon />
                  <input
                    type="text"
                    id="q"
                    name="q"
                    placeholder={t('tours.searchPlaceholder')}
                    value={draft.q}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="tour-filter-field">
                <label htmlFor="sort">
                  <SortRoundedIcon />
                  {t('tours.sort')}
                </label>

                <select
                  id="sort"
                  name="sort"
                  value={draft.sort}
                  onChange={handleChange}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary tours-search-button">
                <SearchRoundedIcon />
                <span>{t('common.findTour')}</span>
              </button>
            </div>

            <div className="filter-card-footer">
              <div className="filter-footer-info">
                <FilterAltOutlinedIcon />
                <span>{t('tours.filterHint')}</span>
              </div>

              {status === 'success' && (
                <div className="results-counter">
                  <Trans
                    i18nKey="tours.resultsCount"
                    count={tours.length}
                    components={{ strong: <strong /> }}
                  />
                </div>
              )}
            </div>
          </form>

          <div className="tours-list-header">
            <div>
              <span className="tours-list-kicker">{t('tours.listKicker')}</span>
              <h2>{t('common.popularTours')}</h2>
            </div>

            {status === 'success' && tours.length > 0 && (
              <span className="tours-list-count">
                {t('common.offersCount', { count: tours.length })}
              </span>
            )}
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && tours.length === 0}
            emptyLabel={hasFilters ? t('tours.emptyFiltered') : t('tours.empty')}
            onRetry={reload}
            emptyAction={
              hasFilters ? (
                <button type="button" className="btn btn-outline-dark" onClick={handleReset}>
                  {t('tours.resetFilters')}
                </button>
              ) : null
            }
          />

          {status === 'success' && tours.length > 0 && (
            <div className="tours-grid">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  isFavorited={isFavorited(tour.dbId)}
                  onToggleFavorite={toggleFavorite}
                  bookHref={bookingHref(tour)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}