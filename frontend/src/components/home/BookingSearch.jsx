import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import muiTheme from '../../theme/muiTheme';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useReveal } from '../../hooks/useReveal';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getDestinations } from '../../services/destinationsService';
import './BookingSearch.css';

// Each option maps onto a real filter of GET /api/tours (via /tours?…) or
// onto the booking form's traveller count. Labels are translated at render.
const TRAVELERS_OPTIONS = [
  { id: 'oneAdult', quantity: 1 },
  { id: 'twoAdults', quantity: 2 },
  { id: 'twoAdultsOneChild', quantity: 3 },
  { id: 'threeToFive', quantity: 3 },
  { id: 'groupSixPlus', quantity: 6 },
];

const BUDGET_OPTIONS = [
  { id: 'any', minPrice: '', maxPrice: '' },
  { id: 'upTo500', minPrice: '', maxPrice: '500' },
  { id: 'from500To1000', minPrice: '500', maxPrice: '1000' },
  { id: 'from1000To2000', minPrice: '1000', maxPrice: '2000' },
  { id: 'over2000', minPrice: '2000', maxPrice: '' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 'var(--control-h-lg)',
    borderRadius: 'var(--radius-control)',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    color: '#0B1F3A',
    transition: 'all 0.25s ease',
    '& fieldset': {
      borderColor: 'rgba(11, 31, 58, 0.12)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(47, 217, 196, 0.55)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(47, 217, 196, 0.12)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2FD9C4',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--color-text-muted)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0B1F3A',
  },
};

/**
 * Homepage tour search. Previously it only played a "searching… done"
 * animation and discarded the input; now it opens the tour catalogue with
 * real filters: destination (from the API) and budget (price range). The
 * traveller count is carried along and pre-fills the booking form.
 */
export default function BookingSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ref, isInView] = useReveal();
  const { data: destinations } = useAsyncData(getDestinations, []);
  const [form, setForm] = useState({
    destination: '',
    travelers: TRAVELERS_OPTIONS[0].id,
    budget: BUDGET_OPTIONS[0].id,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const budget = BUDGET_OPTIONS.find((b) => b.id === form.budget) ?? BUDGET_OPTIONS[0];
    const travelers = TRAVELERS_OPTIONS.find((o) => o.id === form.travelers) ?? TRAVELERS_OPTIONS[0];
    const params = new URLSearchParams();
    if (form.destination) params.set('destination', form.destination);
    if (budget.minPrice) params.set('minPrice', budget.minPrice);
    if (budget.maxPrice) params.set('maxPrice', budget.maxPrice);
    params.set('travelers', String(travelers.quantity));
    navigate(`/tours?${params}`);
  }

  // MUI theme only here (the one public MUI form) — not at the app root,
  // so pages without MUI components don't load it.
  return (
    <ThemeProvider theme={muiTheme}>
    <section className="search-section" id="booking">
      <div className="container">
        <form
          className={`search-card reveal ${isInView ? 'in-view' : ''}`}
          ref={ref}
          onSubmit={handleSubmit}
        >
          <div className="search-heading">
            <span className="search-kicker">{t('home.search.kicker')}</span>
            <h2>{t('home.search.title')}</h2>
            <p>{t('home.search.text')}</p>
          </div>

          <div className="search-fields">
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel id="destination-label">{t('common.destination')}</InputLabel>
              <Select
                labelId="destination-label"
                id="destination"
                name="destination"
                value={form.destination}
                label={t('common.destination')}
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FlightTakeoffOutlinedIcon sx={{ color: '#2FD9C4', fontSize: 21 }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">{t('home.search.destinationPlaceholder')}</MenuItem>
                {(destinations ?? []).map((destination) => (
                  <MenuItem key={destination.slug} value={destination.slug}>
                    {destination.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={fieldSx}>
              <InputLabel id="travelers-label">{t('home.search.travelers')}</InputLabel>
              <Select
                labelId="travelers-label"
                id="travelers"
                name="travelers"
                value={form.travelers}
                label={t('home.search.travelers')}
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon sx={{ color: '#2FD9C4', fontSize: 21 }} />
                  </InputAdornment>
                }
              >
                {TRAVELERS_OPTIONS.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {t(`home.search.travelerOptions.${option.id}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={fieldSx}>
              <InputLabel id="budget-label">{t('home.search.budget')}</InputLabel>
              <Select
                labelId="budget-label"
                id="budget"
                name="budget"
                value={form.budget}
                label={t('home.search.budget')}
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <AccountBalanceWalletOutlinedIcon sx={{ color: '#D4AF6A', fontSize: 21 }} />
                  </InputAdornment>
                }
              >
                {BUDGET_OPTIONS.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {t(`home.search.budgetOptions.${option.id}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <button type="submit" className="btn btn-primary btn-lg btn-search">
              <SearchRoundedIcon />
              {t('common.findTour')}
            </button>
          </div>
        </form>
      </div>
    </section>
    </ThemeProvider>
  );
}
