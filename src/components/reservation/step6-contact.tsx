"use client";

import { useState, useEffect } from "react";
import { Phone, ChevronLeft, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BookingData {
  origin_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
  duration_minutes: number;
  van_size: string;
  num_deliverers: number;
  scheduled_date: string;
  scheduled_slot: string;
  items: { description: string };
  access_origin: string;
  access_destination: string;
  pickup_floors: number;
  dropoff_floors: number;
  handling_option: string;
  handling_minutes: number;
  price_client: number;
}

interface Step6ContactProps {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  priceTotal: number;
  onBack: () => void;
  onBookingComplete: (missionId: string) => void;
  bookingData: BookingData;
}

function CheckoutForm({
  canBook,
  priceTotal,
  onBack,
  onBookingComplete,
  bookingData,
  email,
  phone,
  firstName,
  lastName,
}: {
  canBook: boolean;
  priceTotal: number;
  onBack: () => void;
  onBookingComplete: (missionId: string) => void;
  bookingData: BookingData;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements || !canBook) return;
    setLoading(true);
    setError("");

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/confirmation" },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Une erreur est survenue");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/save-mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookingData,
        customer_email: email,
        customer_phone: phone,
        customer_first_name: firstName,
        customer_last_name: lastName,
        stripe_payment_intent_id: paymentIntent?.id || "",
        status: "pending",
        payment_status: "authorized",
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError("Erreur d'enregistrement. Contactez-nous.");
      setLoading(false);
      return;
    }

    onBookingComplete(result.id);
  };

  return (
    <>
      <div className="mt-8">
        <label className="block text-[14px] font-medium text-gray-900 mb-3">
          Paiement sécurisé
        </label>
        <div className="border border-[#EDEEF1] rounded-[12px] p-4 bg-white">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
        <div className="flex items-start gap-2 mt-3">
          <Lock size={14} className="text-[#3D4BA3] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            Votre carte sera vérifiée mais{" "}
            <strong className="text-gray-700">
              vous ne serez débité qu&apos;à la fin de la prestation
            </strong>
            . Montant autorisé : {priceTotal.toFixed(2).replace(".", ",")} €
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-[12px] bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex space-x-3 pt-8 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Étape précédente"
          className="w-12 h-12 rounded-[12px] border border-[#EDEEF1] flex items-center justify-center hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
        >
          <ChevronLeft size={20} className="text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!stripe || !elements || !canBook || loading}
          className={`flex-1 h-12 rounded-[12px] text-white text-[16px] font-medium leading-6 flex items-center justify-center transition-colors duration-150 ${
            stripe && elements && canBook && !loading
              ? "bg-[#3D4BA3] hover:bg-[rgb(36,50,138)] cursor-pointer"
              : "bg-gray-300 opacity-50 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            "Réserver mon transport"
          )}
        </button>
      </div>
    </>
  );
}

export default function Step6Contact({
  phone,
  email,
  firstName,
  lastName,
  onPhoneChange,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
  priceTotal,
  onBack,
  onBookingComplete,
  bookingData,
}: Step6ContactProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [stripeLoading, setStripeLoading] = useState(true);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (priceTotal <= 0) return;
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: priceTotal }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setStripeLoading(false);
      })
      .catch(() => setStripeLoading(false));
  }, [priceTotal]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const canBook =
    phone.trim().length >= 10 &&
    isValidEmail(email) &&
    firstName.trim() !== "" &&
    lastName.trim() !== "";

  const stripeAppearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#3D4BA3",
      borderRadius: "12px",
      fontFamily: "Inter, system-ui, sans-serif",
    },
  };

  return (
    <div>
      <div className="space-y-8">
        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-2">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="06 12 34 56 78"
              disabled={verified}
              className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white pl-11 pr-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          {!verified && !codeSent && (
            <button
              type="button"
              onClick={() => { if (phone.trim().length >= 10) setCodeSent(true); }}
              disabled={phone.trim().length < 10}
              className={`w-full h-[48px] rounded-[12px] text-white text-[15px] font-medium mt-3 transition-colors ${
                phone.trim().length >= 10
                  ? "bg-[#3D4BA3] hover:bg-[rgb(36,50,138)] cursor-pointer"
                  : "bg-[#3D4BA3]/40 cursor-not-allowed"
              }`}
            >
              Envoyer le code de vérification
            </button>
          )}
          {!verified && codeSent && (
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Entrez le code à 6 chiffres"
                className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] text-center tracking-[0.3em] placeholder:text-gray-400 placeholder:tracking-normal focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { if (code.length === 6) setVerified(true); }}
                  disabled={code.length !== 6}
                  className={`flex-1 h-[44px] rounded-[12px] text-white text-[14px] font-medium transition-colors ${
                    code.length === 6
                      ? "bg-[#3D4BA3] hover:bg-[rgb(36,50,138)] cursor-pointer"
                      : "bg-[#3D4BA3]/40 cursor-not-allowed"
                  }`}
                >
                  Vérifier
                </button>
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setCode(""); }}
                  className="h-[44px] px-4 rounded-[12px] border border-[#EDEEF1] text-[14px] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Renvoyer
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-2">
            Adresse e-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Email"
            className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-gray-900 mb-2">
            Prénom et nom
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Prénom"
              className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Nom"
              className="h-[52px] w-full rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] placeholder:text-gray-400 focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {stripeLoading ? (
        <div className="mt-8 h-[120px] rounded-[12px] border border-[#EDEEF1] flex items-center justify-center bg-white">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-[#3D4BA3]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-400">Chargement du paiement sécurisé...</span>
          </div>
        </div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
          <CheckoutForm
            canBook={canBook}
            priceTotal={priceTotal}
            onBack={onBack}
            onBookingComplete={onBookingComplete}
            bookingData={bookingData}
            email={email}
            phone={phone}
            firstName={firstName}
            lastName={lastName}
          />
        </Elements>
      ) : (
        <div className="mt-8 p-4 rounded-[12px] bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">Impossible de charger le paiement. Veuillez réessayer.</p>
        </div>
      )}
    </div>
  );
}