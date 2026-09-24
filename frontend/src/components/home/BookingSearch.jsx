
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../../hooks/useReveal';
import { scrollToId } from '../../utils/scrollToId';
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import './BookingSearch.css';

// Option values are stable ids; their labels are translated at render.
const DESTINATIONS_OPTIONS = [
  'dubai',
  'istanbul',
  'maldives',
  'hurghada',
  'phuket',
  'jeddah',
  'moscow',
  'samarkand',
];

const TRAVELERS_OPTIONS = [
  'oneAdult',
  'twoAdults',
  'twoAdultsOneChild',
  'threeToFive',
  'groupSixPlus',
];

const BUDGET_OPTIONS = [
  'upTo500',
  'from500To1000',
  'from1000To2000',
  'over2000',
];

const IDLE = 'idle';
const SEARCHING = 'searching';
const DONE = 'done';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 58,
    borderRadius: '14px',
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
    color: 'rgba(11, 31, 58, 0.58)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0B1F3A',
  },
};

export default function BookingSearch() {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [form, setForm] = useState({
    destination: '',
    depart: '',
    return: '',
    travelers: TRAVELERS_OPTIONS[0],
    budget: BUDGET_OPTIONS[0],
  });
  const [status, setStatus] = useState(IDLE);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStatus(SEARCHING);
    setTimeout(() => {
      setStatus(DONE);
      setTimeout(() => setStatus(IDLE), 2200);
    }, 900);
    scrollToId('contact');
  }

  const buttonLabel =
    status === SEARCHING
      ? t('home.search.searching')
      : status === DONE
        ? t('home.search.done')
        : t('common.findTour');

  return (
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
                <MenuItem value="">
                  {t('home.search.destinationPlaceholder')}
                </MenuItem>
                {DESTINATIONS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {t(`home.search.destinationOptions.${option}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
  fullWidth
  type="date"
  label={t('home.search.departDate')}
  name="depart"
  value={form.depart}
  onChange={handleChange}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
  sx={{
    ...fieldSx,
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: '#fff',
      padding: '0 5px',
    },
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <CalendarMonthOutlinedIcon
          sx={{
            color: '#2FD9C4',
            fontSize: 21,
          }}
        />
      </InputAdornment>
    ),
  }}
/>

<TextField
  fullWidth
  type="date"
  label={t('home.search.returnDate')}
  name="return"
  value={form.return}
  onChange={handleChange}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
  sx={{
    ...fieldSx,
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: '#fff',
      padding: '0 5px',
    },
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <CalendarMonthOutlinedIcon
          sx={{
            color: '#D4AF6A',
            fontSize: 21,
          }}
        />
      </InputAdornment>
    ),
  }}
/>

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
                  <MenuItem key={option} value={option}>
                    {t(`home.search.travelerOptions.${option}`)}
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
                  <MenuItem key={option} value={option}>
                    {t(`home.search.budgetOptions.${option}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <button
              type="submit"
              className="btn btn-search"
              disabled={status === SEARCHING}
            >
              <SearchRoundedIcon />
              <span>{buttonLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
