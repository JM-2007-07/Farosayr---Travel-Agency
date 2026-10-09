import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import i18n from '../../i18n';
import './LocationMap.css';

const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

let yandexMapsPromise = null;

function loadYandexMaps() {
  if (window.ymaps3) {
    return Promise.resolve(window.ymaps3);
  }

  if (yandexMapsPromise) {
    return yandexMapsPromise;
  }

  yandexMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-yandex-maps]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve(window.ymaps3);
      });

      existingScript.addEventListener('error', reject);

      return;
    }

    const script = document.createElement('script');

    // Yandex Maps has no Tajik locale, so tj uses the Russian map labels.
    const mapLang = i18n.language === 'en' ? 'en_US' : 'ru_RU';
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${API_KEY}&lang=${mapLang}`;
    script.async = true;
    script.dataset.yandexMaps = 'true';

    script.onload = () => {
      if (!window.ymaps3) {
        reject(new Error('Yandex Maps API не загрузился.'));
        return;
      }

      resolve(window.ymaps3);
    };

    script.onerror = () => {
      reject(new Error('Не удалось загрузить Yandex Maps API.'));
    };

    document.head.appendChild(script);
  });

  return yandexMapsPromise;
}

export default function LocationMap({ lat, lng, popupText }) {
  const { t } = useTranslation();
  const markerText = popupText ?? t('map.officePopup');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(false);
  // The Yandex Maps script and tiles are only fetched once the map is about
  // to scroll into view — both maps sit near the bottom of their pages.
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = mapRef.current;
    if (!node || nearViewport) return undefined;
    if (!('IntersectionObserver' in window)) {
      setNearViewport(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearViewport]);

  useEffect(() => {
    if (!nearViewport) return undefined;
    let cancelled = false;

    async function initializeMap() {
      try {
        if (!API_KEY) {
          throw new Error(
            'Не найден VITE_YANDEX_MAPS_API_KEY в .env',
          );
        }

        const ymaps3 = await loadYandexMaps();

        await ymaps3.ready;

        if (cancelled || !mapRef.current) {
          return;
        }

        const {
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapMarker,
        } = ymaps3;

        const map = new YMap(mapRef.current, {
          location: {
            center: [lng, lat],
            zoom: 16,
          },
          mode: 'vector',
          // On touch screens a one-finger drag would pan the map instead of
          // scrolling the page (the map is nearly full-width on phones), so
          // there it only zooms; panning stays available with a mouse.
          behaviors: window.matchMedia('(pointer: coarse)').matches
            ? ['pinchZoom', 'dblClick']
            : ['drag', 'scrollZoom', 'pinchZoom', 'dblClick'],
        });

        map.addChild(
          new YMapDefaultSchemeLayer({
            customization: [
              {
                tags: {
                  any: ['landscape', 'poi'],
                },
                stylers: [
                  {
                    saturation: -0.35,
                  },
                ],
              },
            ],
          }),
        );

        map.addChild(new YMapDefaultFeaturesLayer());

        // Built with DOM APIs + textContent rather than innerHTML, so the
        // label (`popupText` is a prop) can never be interpreted as HTML.
        const el = (tag, className, text) => {
          const node = document.createElement(tag);
          if (className) node.className = className;
          if (text !== undefined) node.textContent = text;
          return node;
        };

        const markerElement = el('div', 'yandex-farosayr-marker');
        const pin = el('div', 'yandex-marker-pin');
        const inner = el('div', 'yandex-marker-inner');
        inner.append(el('span', 'yandex-marker-dot'));
        pin.append(inner);
        const label = el('div', 'yandex-marker-label');
        label.append(el('strong', null, 'Farosayr'), el('span', null, markerText));
        markerElement.append(el('div', 'yandex-marker-pulse'), pin, label);

        const marker = new YMapMarker(
          {
            coordinates: [lng, lat],
            draggable: false,
          },
          markerElement,
        );

        map.addChild(marker);

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        console.error(err);

        // Technical details stay in the console above; users get a
        // translated message.
        if (!cancelled) {
          setError(true);
        }
      }
    }

    initializeMap();

    return () => {
      cancelled = true;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }

      markerRef.current = null;
    };
  }, [lat, lng, markerText, nearViewport]);

  if (error) {
    return (
      <div className="location-map-error">
        <LocationOnIcon aria-hidden="true" />
        <div>
          <span>{t('map.loadError')}</span>
          {/* The address is also written out next to every map; this link
              is the way to the interactive map when it can't load here. */}
          <a
            className="location-map-error-link"
            href={`https://yandex.ru/maps/?pt=${lng},${lat}&z=17&l=map`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('map.openInYandex')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="location-map"
      role="region"
      aria-label={t('map.ariaLabel')}
    />
  );
}