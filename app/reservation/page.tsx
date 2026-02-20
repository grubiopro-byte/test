"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { ChevronLeft, ArrowUp, ArrowDown, Truck, DollarSign, Calendar, Package, User, Pencil, Building } from "lucide-react";
import {
  useJsApiLoader,
  Autocomplete,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import Step2Vehicle from "@/src/components/reservation/step2-vehicle";
import Step3DateTime from "@/src/components/reservation/step3-datetime";
import Step4Items from "@/src/components/reservation/step4-items";
import Step5Access from "@/src/components/reservation/step5-access";
import Step6Contact from "@/src/components/reservation/step6-contact";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const TOTAL_STEPS = 6;

const STEP_CONTENT = [
  {
    title: "Départ & arrivée",
    subtitle: "Entrez vos adresses de départ et d'arrivée",
  },
  {
    title: "Date & heure",
    subtitle: "Choisissez l'heure d'arrivée souhaitée",
  },
  {
    title: "Véhicule",
    subtitle: "Choisissez le véhicule adapté à votre livraison",
  },
  {
    title: "Objets à transporter",
    subtitle: "Décrivez ce que vous transportez",
  },
  {
    title: "Accès & manutention",
    subtitle: "Précisez les conditions d'accès et la durée",
  },
  {
    title: "Vos coordonnées",
    subtitle: "Ces informations serviront à vous contacter",
  },
];

export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Google Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // État des adresses
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupApt, setPickupApt] = useState("");
  const [pickupEditing, setPickupEditing] = useState(true);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffApt, setDropoffApt] = useState("");
  const [dropoffEditing, setDropoffEditing] = useState(true);

  // Coordonnées GPS
  const [pickupLat, setPickupLat] = useState(0);
  const [pickupLng, setPickupLng] = useState(0);
  const [dropoffLat, setDropoffLat] = useState(0);
  const [dropoffLng, setDropoffLng] = useState(0);

  // Route
  const [routeMinutes, setRouteMinutes] = useState(30);
  const [routeMeters, setRouteMeters] = useState(0);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [bestRouteIndex, setBestRouteIndex] = useState(0);

  // Autocomplete refs
  const [autocompletePickup, setAutocompletePickup] = useState<google.maps.places.Autocomplete | null>(null);
  const [autocompleteDropoff, setAutocompleteDropoff] = useState<google.maps.places.Autocomplete | null>(null);

  // Map ref
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 48.8566, lng: 2.3522 });
  const [mapZoom, setMapZoom] = useState(12);

  // État véhicule et livrizeurs
  const [vehicle, setVehicle] = useState("11m3");
  const [movers, setMovers] = useState<1 | 2>(1);

  // État date et créneau
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState("8h - 9h");

  // État objets à transporter
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [additionalContact, setAdditionalContact] = useState("");

  // État accès et manutention
  const [pickupAccess, setPickupAccess] = useState("pied_camion");
  const [pickupFloors, setPickupFloors] = useState(2);
  const [dropoffAccess, setDropoffAccess] = useState("pied_camion");
  const [dropoffFloors, setDropoffFloors] = useState(2);
  const [manutention, setManutention] = useState("express");

  // État coordonnées (Step 6)
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Calcul automatique de la route (avec trafic si date+créneau connus)
  useEffect(() => {
    if (!isLoaded || !pickupLat || !dropoffLat) return;

    // Utiliser le milieu du créneau comme heure de départ (ex: "10h - 11h" → 10:30)
    let departureTime: Date | undefined;
    if (selectedDay && selectedSlot) {
      const match = selectedSlot.match(/^(\d+)h\s*-\s*(\d+)h/);
      if (match) {
        const totalMinutes = ((parseInt(match[1]) + parseInt(match[2])) / 2) * 60;
        const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const mm = String(totalMinutes % 60).padStart(2, "0");
        const d = new Date(`${selectedDay}T${hh}:${mm}:00`);
        departureTime = d > new Date() ? d : new Date();
      }
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: pickupLat, lng: pickupLng },
        destination: { lat: dropoffLat, lng: dropoffLng },
        travelMode: google.maps.TravelMode.DRIVING,
        ...(departureTime && {
          drivingOptions: {
            departureTime,
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        }),
      },
      (result, status) => {
        if (status === "OK" && result) {
          // Utiliser la route recommandée (index 0), identique à Google Maps
          const leg = result.routes[0].legs[0];
          const secs = leg.duration_in_traffic?.value ?? leg.duration?.value ?? 0;
          setDirections(result);
          setBestRouteIndex(0);
          setRouteMinutes(Math.round(secs / 60));
          setRouteMeters(leg.distance!.value);
        }
      }
    );
  }, [isLoaded, pickupLat, pickupLng, dropoffLat, dropoffLng, selectedDay, selectedSlot]);

  // Recadrer la carte une seule fois quand le trajet change
  useEffect(() => {
    if (map && directions) {
      const bounds = directions.routes[0].bounds;
      if (bounds) {
        map.fitBounds(bounds, { top: 60, right: 40, bottom: 20, left: 40 });
        // Sauvegarder le centre et zoom après le fitBounds
        setTimeout(() => {
          const center = map.getCenter();
          const zoom = map.getZoom();
          if (center && zoom) {
            setMapCenter({ lat: center.lat(), lng: center.lng() });
            setMapZoom(zoom);
          }
        }, 300);
      }
    }
  }, [map, directions]);

  // Formatage du véhicule pour le récap
  const getVehicleLabel = () => {
    if (currentStep < 2) return "—";
    const vehicleLabels: Record<string, string> = {
      "11m3": "11m³",
    };
    return `Fourgon ${vehicleLabels[vehicle]} • ${movers} Livrizeur${movers > 1 ? "s" : ""}`;
  };

  // Calcul du prix
  const calculatePrice = () => {
    const vehicleRates: Record<string, { solo: number; duo: number }> = {
      "11m3": { solo: 1.15, duo: 1.5375 },
    };
    const rate = movers === 1 ? vehicleRates[vehicle].solo : vehicleRates[vehicle].duo;
    const M = routeMinutes + 30; // + 30 min manutention incluses
    const P_base = rate * M;

    // Calcul option manutention
    const manutentionExtras: Record<string, { extraMin: number; extraPercent: number }> = {
      express: { extraMin: 0, extraPercent: 0 },
      prolongee: { extraMin: 60, extraPercent: 0.15 },
      prolongee_plus: { extraMin: 120, extraPercent: 0.15 },
      prolongee_max: { extraMin: 180, extraPercent: 0.1 },
    };
    const extra = manutentionExtras[manutention] || manutentionExtras.express;
    const P_extra = rate * extra.extraMin * (1 + extra.extraPercent);

    // Supplément étages sans ascenseur
    const stairsSurcharge =
      (pickupAccess === "etages_sans_ascenseur" ? 5 : 0) +
      (dropoffAccess === "etages_sans_ascenseur" ? 5 : 0);

    const priceTotal = P_base + P_extra + stairsSurcharge;
    return { priceTotal, rate };
  };

  // Formatage du prix pour le récap
  const getPriceLabel = () => {
    if (currentStep < 3) return "—";
    const { priceTotal, rate } = calculatePrice();
    return (
      <span className="flex items-center gap-2">
        {priceTotal.toFixed(2).replace(".", ",")} € + {rate.toFixed(2).replace(".", ",")} €/min
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-[rgb(36,50,138)]"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  };

  // Formatage du créneau pour le récap
  const getScheduleLabel = () => {
    if (currentStep < 3) return "—";
    // "T12:00:00" évite le décalage UTC qui peut changer le jour affiché
    const date = new Date(selectedDay + "T12:00:00");
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const monthNames = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "aoû", "sep", "oct", "nov", "déc"];
    const dayName = dayNames[date.getDay()];
    const dayNum = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${dayName} ${dayNum} ${month} · ${selectedSlot}`;
  };

  // Formatage des objets pour le récap
  const getItemsLabel = () => {
    if (currentStep < 4 || !description.trim()) return "—";
    // Afficher les 30 premiers caractères + "..." si plus long
    return description.length > 30 ? description.substring(0, 30) + "..." : description;
  };

  const RECAP_ITEMS = [
    { icon: ArrowUp, label: "Enlèvement", value: pickupAddress || "—" },
    { icon: ArrowDown, label: "Livraison", value: dropoffAddress || "—" },
    { icon: Truck, label: "Véhicule", value: getVehicleLabel() },
    { icon: DollarSign, label: "Prix", value: getPriceLabel() },
    { icon: Calendar, label: "Créneau d'arrivée", value: getScheduleLabel() },
    { icon: Package, label: "Objets à transporter", value: getItemsLabel() },
  ];

  const canContinue = () => {
    if (currentStep === 1) {
      return pickupAddress.trim() !== "" && dropoffAddress.trim() !== "";
    }
    if (currentStep === 2) {
      return selectedDay !== "" && selectedSlot !== "";
    }
    if (currentStep === 4) {
      return description.trim() !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canContinue()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] relative bg-[#F7F7F8] md:bg-[linear-gradient(to_right,#FAFAFA_50%,#FFFFFF_50%)]">
      {/* Header mobile */}
      <header className="md:hidden flex items-center justify-between px-6 pt-5 pb-3">
        <h1 className="text-[22px] font-bold text-[#3D4BA3]">livrizi</h1>
        <button
          aria-label="Se connecter"
          className="flex items-center gap-2 text-[14px] text-[#3D4BA3] hover:text-[rgb(36,50,138)] font-medium transition-colors"
        >
          <User size={16} />
          <span>Se connecter</span>
        </button>
      </header>

      <div className="mx-auto flex max-w-[53rem] justify-center min-h-screen min-h-[100dvh]">
        {/* COLONNE GAUCHE — Récap "Votre Livrizi" */}
        <aside className="hidden md:flex relative w-full lg:max-w-[26.5rem] flex-col self-stretch px-6 pt-[max(100px,10vh)]">
          {/* Header avec logo et Se connecter */}
          <header className="mb-7">
            <div className="container flex min-h-[56px] items-center space-x-3 pt-4">
              <h1 className="flex-1 text-[22px] font-bold text-[#3D4BA3]">livrizi</h1>
              <div>
                <button 
                  aria-label="Se connecter"
                  className="flex items-center gap-2 text-[14px] text-[#3D4BA3] hover:text-[rgb(36,50,138)] font-medium transition-colors"
                >
                  <User size={16} />
                  <span>Se connecter</span>
                </button>
              </div>
            </div>
          </header>

          {/* Titre */}
          <h2 className="text-[22px] font-semibold text-gray-900 mb-9">Votre Livrizi</h2>

          {/* Carte Google Maps */}
          <div className="w-full h-[200px] rounded-[12px] overflow-hidden mb-8">
            {isLoaded ? (
              <GoogleMap
                onLoad={(mapInstance) => setMap(mapInstance)}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={mapZoom}
                options={{
                  disableDefaultUI: true,
                  zoomControl: false,
                  draggable: false,
                  scrollwheel: false,
                  disableDoubleClickZoom: true,
                  gestureHandling: "none",
                  styles: [
                    {
                      featureType: "poi",
                      stylers: [{ visibility: "off" }],
                    },
                  ],
                }}
              >
                {pickupLat !== 0 && (
                  <Marker
                    position={{ lat: pickupLat, lng: pickupLng }}
                    label={{ text: "A", color: "white", fontWeight: "bold" }}
                  />
                )}
                {dropoffLat !== 0 && (
                  <Marker
                    position={{ lat: dropoffLat, lng: dropoffLng }}
                    label={{ text: "B", color: "white", fontWeight: "bold" }}
                  />
                )}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      routeIndex: bestRouteIndex,
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: "#3D4BA3",
                        strokeWeight: 4,
                      },
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                <span className="text-gray-400 text-sm">Chargement de la carte...</span>
              </div>
            )}
          </div>

          {/* Récap timeline avec ligne verticale */}
          <div className="relative space-y-8 before:absolute before:bottom-[40px] before:left-[15px] before:top-4 before:z-0 before:w-0.5 before:bg-gray-200 before:content-['']">
            {RECAP_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex w-full space-x-4 cursor-auto">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDEEF1] z-10">
                    <Icon size={20} className="text-[#6B7280]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 space-y-0.5 text-left">
                    <label className="text-[13px] block text-gray-600">{item.label}</label>
                    <h3 className="text-[15px] font-medium leading-none text-black">
                      {item.value === "—" ? <div className="ml-px h-0.5 w-4 translate-y-1.5 bg-black"></div> : item.value}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 pb-6">
            <p className="text-[12px] text-gray-400">
              powered by livrizi · <a href="#" className="hover:underline">Conditions</a> | <a href="#" className="hover:underline">Confidentialité</a>
            </p>
          </div>
        </aside>

        {/* COLONNE DROITE — Formulaire */}
        <aside className="relative w-full lg:max-w-[26.5rem] px-4 md:px-0">
          <div className="pb-[84px] lg:pb-0 pt-5 md:pt-8 lg:pt-10 px-5 md:px-6 lg:px-10 bg-white md:bg-transparent rounded-2xl md:rounded-none mb-4 md:mb-0">
            {/* Header stepper */}
            <header className="container mb-4 lg:mb-8">
              {/* Step indicator */}
              <p className="text-[#E8891D] mb-5 text-base font-medium">
                ÉTAPE {currentStep}/{TOTAL_STEPS}
              </p>

              {/* Progress bar */}
              <div className="flex gap-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
                  const step = index + 1;
                  const isCompleted = step < currentStep;
                  const isCurrent = step === currentStep;
                  return (
                    <div
                      key={step}
                      className="h-[3px] rounded-full flex-1"
                      style={{
                        backgroundColor: isCompleted || isCurrent ? "#E8891D" : "#E5E7EB",
                      }}
                    />
                  );
                })}
              </div>
            </header>

            {/* Titre + sous-titre */}
            <section className="mb-5 container">
              <div className="space-y-1">
                <h2 className="text-[34px] font-bold leading-tight text-gray-900">
                  {STEP_CONTENT[currentStep - 1].title}
                </h2>
                <p className="text-[15px] text-gray-600">
                  {STEP_CONTENT[currentStep - 1].subtitle}
                </p>
              </div>

              {/* Zone de contenu */}
              <form className="mt-10">
                {currentStep === 1 && (
                  <div className="space-y-10">
                    {/* Section Adresse de départ */}
                    <fieldset className="group space-y-3">
                      <label className="block text-[14px] text-gray-600 font-medium">
                        Adresse de départ
                      </label>

                      {pickupEditing ? (
                        isLoaded ? (
                          <Autocomplete
                            onLoad={(auto) => setAutocompletePickup(auto)}
                            onPlaceChanged={() => {
                              if (autocompletePickup) {
                                const place = autocompletePickup.getPlace();
                                if (place.formatted_address && place.geometry?.location) {
                                  setPickupAddress(place.formatted_address);
                                  setPickupLat(place.geometry.location.lat());
                                  setPickupLng(place.geometry.location.lng());
                                  setPickupEditing(false);
                                }
                              }
                            }}
                            options={{
                              componentRestrictions: { country: "fr" },
                              types: ["address"],
                            }}
                          >
                            <input
                              type="text"
                              value={pickupAddress}
                              onChange={(e) => setPickupAddress(e.target.value)}
                              placeholder="Entrez l'adresse de départ"
                              className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}
                            placeholder="Chargement..."
                            disabled
                            className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-gray-50 px-4 text-[15px] placeholder:text-gray-400 outline-none"
                          />
                        )
                      ) : (
                        <div className="flex items-start justify-between py-2">
                          <div className="flex items-start gap-3 flex-1">
                            <ArrowUp size={18} className="text-[#6B7280] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-[15px] font-semibold text-gray-900">
                                {pickupAddress.split(",")[0]}
                              </div>
                              <div className="text-[13px] text-gray-400 mt-1">
                                {pickupAddress.split(",").slice(1).join(",").trim()}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPickupEditing(true)}
                            aria-label="Modifier l'adresse de départ"
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Pencil size={16} className="text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        <Building
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={pickupApt}
                          onChange={(e) => setPickupApt(e.target.value)}
                          placeholder="N° apt, bâtiment (optionnel)"
                          className="h-[48px] w-full rounded-[12px] border border-[#EDEEF1] bg-white pl-11 pr-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
                        />
                      </div>
                    </fieldset>

                    {/* Section Adresse d'arrivée */}
                    <fieldset className="group space-y-3">
                      <label className="block text-[14px] text-gray-600 font-medium">
                        Adresse d'arrivée
                      </label>

                      {dropoffEditing ? (
                        isLoaded ? (
                          <Autocomplete
                            onLoad={(auto) => setAutocompleteDropoff(auto)}
                            onPlaceChanged={() => {
                              if (autocompleteDropoff) {
                                const place = autocompleteDropoff.getPlace();
                                if (place.formatted_address && place.geometry?.location) {
                                  setDropoffAddress(place.formatted_address);
                                  setDropoffLat(place.geometry.location.lat());
                                  setDropoffLng(place.geometry.location.lng());
                                  setDropoffEditing(false);
                                }
                              }
                            }}
                            options={{
                              componentRestrictions: { country: "fr" },
                              types: ["address"],
                            }}
                          >
                            <input
                              type="text"
                              value={dropoffAddress}
                              onChange={(e) => setDropoffAddress(e.target.value)}
                              placeholder="Entrez l'adresse d'arrivée"
                              className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={dropoffAddress}
                            onChange={(e) => setDropoffAddress(e.target.value)}
                            placeholder="Chargement..."
                            disabled
                            className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-gray-50 px-4 text-[15px] placeholder:text-gray-400 outline-none"
                          />
                        )
                      ) : (
                        <div className="flex items-start justify-between py-2">
                          <div className="flex items-start gap-3 flex-1">
                            <ArrowDown size={18} className="text-[#6B7280] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-[15px] font-semibold text-gray-900">
                                {dropoffAddress.split(",")[0]}
                              </div>
                              <div className="text-[13px] text-gray-400 mt-1">
                                {dropoffAddress.split(",").slice(1).join(",").trim()}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDropoffEditing(true)}
                            aria-label="Modifier l'adresse d'arrivée"
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Pencil size={16} className="text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        <Building
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={dropoffApt}
                          onChange={(e) => setDropoffApt(e.target.value)}
                          placeholder="N° apt, bâtiment (optionnel)"
                          className="h-[48px] w-full rounded-[12px] border border-[#EDEEF1] bg-white pl-11 pr-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
                        />
                      </div>
                    </fieldset>
                  </div>
                )}

                {currentStep === 2 && (
                  <Step3DateTime
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    onDayChange={setSelectedDay}
                    onSlotChange={setSelectedSlot}
                  />
                )}

                {currentStep === 3 && (
                  <Step2Vehicle
                    movers={movers}
                    onMoversChange={setMovers}
                    routeMinutes={routeMinutes}
                  />
                )}

                {currentStep === 4 && (
                  <Step4Items
                    description={description}
                    photos={photos}
                    additionalContact={additionalContact}
                    onDescriptionChange={setDescription}
                    onPhotosChange={setPhotos}
                    onAdditionalContactChange={setAdditionalContact}
                  />
                )}

                {currentStep === 5 && (
                  <Step5Access
                    pickupAccess={pickupAccess}
                    pickupFloors={pickupFloors}
                    dropoffAccess={dropoffAccess}
                    dropoffFloors={dropoffFloors}
                    manutention={manutention}
                    onPickupAccessChange={setPickupAccess}
                    onPickupFloorsChange={setPickupFloors}
                    onDropoffAccessChange={setDropoffAccess}
                    onDropoffFloorsChange={setDropoffFloors}
                    onManutentionChange={setManutention}
                    vehicle={vehicle}
                    movers={movers}
                    routeMinutes={routeMinutes}
                  />
                )}

                {currentStep === 6 && (
                  <>
                    {/* Récap éditable — visible sur mobile uniquement */}
                    <div className="md:hidden mb-8">
                      <h3 className="text-[16px] font-semibold text-gray-900 mb-4">Récapitulatif</h3>
                      <div className="space-y-0 divide-y divide-[#EDEEF1] border border-[#EDEEF1] rounded-[12px] overflow-hidden">
                        {/* Adresses */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-gray-400">Adresses</p>
                            <p className="text-[14px] text-gray-900 truncate">{pickupAddress} → {dropoffAddress}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-[13px] text-[#3D4BA3] font-medium ml-3 shrink-0"
                          >
                            Modifier
                          </button>
                        </div>

                        {/* Véhicule */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-gray-400">Véhicule</p>
                            <p className="text-[14px] text-gray-900">{getVehicleLabel()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-[13px] text-[#3D4BA3] font-medium ml-3 shrink-0"
                          >
                            Modifier
                          </button>
                        </div>

                        {/* Créneau */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-gray-400">Créneau d'arrivée</p>
                            <p className="text-[14px] text-gray-900">{getScheduleLabel()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-[13px] text-[#3D4BA3] font-medium ml-3 shrink-0"
                          >
                            Modifier
                          </button>
                        </div>

                        {/* Objets */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-gray-400">Objets</p>
                            <p className="text-[14px] text-gray-900 truncate">{getItemsLabel()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="text-[13px] text-[#3D4BA3] font-medium ml-3 shrink-0"
                          >
                            Modifier
                          </button>
                        </div>

                        {/* Accès & manutention */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-gray-400">Accès & manutention</p>
                            <p className="text-[14px] text-gray-900">
                              {manutention === 'express' ? 'Express (30 min)' :
                               manutention === 'prolongee' ? '+1h (1h30)' :
                               manutention === 'prolongee_plus' ? '+2h (2h30)' : '+3h (3h30)'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-[13px] text-[#3D4BA3] font-medium ml-3 shrink-0"
                          >
                            Modifier
                          </button>
                        </div>

                        {/* Prix total */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[rgba(61,75,163,0.03)]">
                          <div>
                            <p className="text-[12px] text-gray-400">Prix estimé</p>
                            <p className="text-[16px] font-bold text-[#3D4BA3]">
                              {calculatePrice().priceTotal.toFixed(2).replace('.', ',')} €
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Step6Contact
                      phone={phone}
                      email={email}
                      firstName={firstName}
                      lastName={lastName}
                      onPhoneChange={setPhone}
                      onEmailChange={setEmail}
                      onFirstNameChange={setFirstName}
                      onLastNameChange={setLastName}
                      priceTotal={calculatePrice().priceTotal}
                      onBack={handleBack}
                      onBookingComplete={(missionId: string) => {
                        window.location.href = `/confirmation?id=${missionId}`;
                      }}
                      bookingData={{
                        origin_address: pickupAddress,
                        origin_lat: pickupLat,
                        origin_lng: pickupLng,
                        destination_address: dropoffAddress,
                        destination_lat: dropoffLat,
                        destination_lng: dropoffLng,
                        distance_km: Math.round(routeMeters / 100) / 10,
                        duration_minutes: routeMinutes,
                        van_size: vehicle,
                        num_deliverers: movers,
                        scheduled_date: selectedDay,
                        scheduled_slot: selectedSlot,
                        items: { description },
                        access_origin: pickupAccess,
                        access_destination: dropoffAccess,
                        pickup_floors: pickupFloors,
                        dropoff_floors: dropoffFloors,
                        handling_option: manutention,
                        handling_minutes: manutention === 'express' ? 0 : manutention === 'prolongee' ? 60 : manutention === 'prolongee_plus' ? 120 : 180,
                        price_client: calculatePrice().priceTotal,
                      }}
                    />
                  </>
                )}
              </form>
            </section>

            {/* Footer boutons (cachés au Step 6 car Step6 a ses propres boutons) */}
            {currentStep !== 6 && (
              <nav className="container flex space-x-3 pb-3 pt-6">
                {/* Bouton retour (caché au Step 1) */}
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    aria-label="Étape précédente"
                    className="w-12 h-12 rounded-[12px] border border-[#EDEEF1] flex items-center justify-center hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <ChevronLeft size={20} className="text-[#6B7280]" />
                  </button>
                )}

                {/* Bouton Continuer */}
                <button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  type="submit"
                  className={`flex-1 h-12 rounded-[12px] text-white text-[16px] font-medium leading-6 flex items-center justify-center transition-colors duration-150 ${
                    canContinue()
                      ? "bg-[#3D4BA3] hover:bg-[rgb(36,50,138)] cursor-pointer"
                      : "bg-gray-300 opacity-50 cursor-not-allowed"
                  }`}
                >
                  Continuer
                </button>
              </nav>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
