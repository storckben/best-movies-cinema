import { useState, useMemo, useEffect } from 'react';
import { X, MapPin, Loader2, Navigation } from 'lucide-react';
import { getStates, getCities, getCinemas, cinemaLocations } from '@/lib/cinemaLocations';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (cinema: string) => void;
}

export default function CinemaSelector({ open, onClose, onSelect }: Props) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const states = useMemo(() => getStates(), []);
  const cities = useMemo(() => (selectedState ? getCities(selectedState) : []), [selectedState]);
  const cinemas = useMemo(() => (selectedState && selectedCity ? getCinemas(selectedState, selectedCity) : []), [selectedState, selectedCity]);

  // Try geolocation when opened and no previous location saved
  useEffect(() => {
    if (!open) return;
    const alreadyGeolocated = localStorage.getItem('geo_city_detected');
    if (alreadyGeolocated || selectedState) return;

    requestGeolocation();
  }, [open]);

  async function requestGeolocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não suportada neste navegador.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode using Nominatim (OpenStreetMap)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
        { headers: { 'User-Agent': 'Cinemak/1.0' } }
      );
      const data = await res.json();

      const city = data.address?.city || data.address?.town || data.address?.municipality || '';
      const stateCode = data.address?.['ISO3166-2-lvl4']?.replace('BR-', '') || '';

      if (city && stateCode) {
        localStorage.setItem('geo_city_detected', JSON.stringify({ city, state: stateCode }));

        // Try to match with our cinema locations
        const match = cinemaLocations.find(
          l => l.state === stateCode && l.city.toLowerCase() === city.toLowerCase()
        );

        if (match) {
          setSelectedState(match.state);
          // Need to wait a tick for cities to recalculate
          setTimeout(() => {
            setSelectedCity(match.city);
          }, 50);
        } else {
          // Try partial match on state
          const stateMatch = cinemaLocations.find(l => l.state === stateCode);
          if (stateMatch) {
            setSelectedState(stateMatch.state);
          }
          setGeoError(`Nenhum cinema encontrado em ${city}. Selecione manualmente.`);
        }
      }
    } catch (err: any) {
      if (err?.code === 1) {
        setGeoError('Permissão de localização negada.');
      } else {
        setGeoError('Não foi possível obter sua localização.');
      }
    } finally {
      setGeoLoading(false);
    }
  }

  function handleStateChange(value: string) {
    setSelectedState(value);
    setSelectedCity('');
    setSelectedCinema('');
  }

  function handleCityChange(value: string) {
    setSelectedCity(value);
    setSelectedCinema('');
  }

  function handleApply() {
    if (selectedCinema) {
      onSelect(selectedCinema);
      handleClose();
    }
  }

  function handleClose() {
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-card shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Escolha seu cinema</h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-6 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para sua experiência ser incrível, escolha um cinema abaixo:
            </p>

            {/* Geolocation status */}
            {geoLoading && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Detectando sua localização...</span>
              </div>
            )}

            {geoError && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-lg px-4 py-3">
                <Navigation className="h-4 w-4" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Estado
              </label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60 z-[80]">
                  {states.map(s => (
                    <SelectItem key={s.state} value={s.state}>
                      {s.stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cidade
              </label>
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
                disabled={!selectedState}
              >
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60 z-[80]">
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cinema */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cinema
              </label>
              <Select
                value={selectedCinema}
                onValueChange={setSelectedCinema}
                disabled={!selectedCity}
              >
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Selecione o cinema" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60 z-[80]">
                  {cinemas.map(cinema => (
                    <SelectItem key={cinema} value={cinema}>
                      {cinema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aplicar */}
            <button
              onClick={handleApply}
              disabled={!selectedCinema}
              className="w-full rounded bg-primary py-3 text-sm font-bold uppercase text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Aplicar
            </button>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
