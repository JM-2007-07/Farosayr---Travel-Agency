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

  useEffect(() => {
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
          behaviors: [
            'drag',
            'scrollZoom',
            'pinchZoom',
            'dblClick',
          ],
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

        const markerElement = document.createElement('div');

        markerElement.className = 'yandex-farosayr-marker';

        markerElement.innerHTML = `
          <div class="yandex-marker-pulse"></div>
          <div class="yandex-marker-pin">
            <div class="yandex-marker-inner">
              <span class="yandex-marker-dot"></span>
            </div>
          </div>
          <div class="yandex-marker-label">
            <strong>Farosayr</strong>
            <span>${markerText}</span>
          </div>
        `;

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
  }, [lat, lng, markerText]);

  if (error) {
    return (
      <div className="location-map-error">
        <LocationOnIcon />
        <span>{t('map.loadError')}</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="location-map"
      aria-label={t('map.ariaLabel')}
    />
  );
}