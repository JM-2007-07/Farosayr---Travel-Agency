import { useEffect, useRef, useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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

    script.src = `https://api-maps.yandex.ru/v3/?apikey=${API_KEY}&lang=ru_RU`;
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

export default function LocationMap({
  lat,
  lng,
  popupText = 'Farosayr — офис',
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState('');

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
            <span>${popupText}</span>
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

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Не удалось загрузить карту.',
          );
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
  }, [lat, lng, popupText]);

  if (error) {
    return (
      <div className="location-map-error">
        <LocationOnIcon />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="location-map"
      aria-label="Карта офиса Farosayr"
    />
  );
}