import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";
import { buildMissionConfirmationEmail } from "@/lib/emails/mission-confirmation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // Clé service role (sans NEXT_PUBLIC_) pour bypasser les RLS en server-side
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();

  // Whitelist explicite — on n'accepte jamais status/payment_status du client
  const mission = {
    origin_address: body.origin_address,
    origin_lat: body.origin_lat,
    origin_lng: body.origin_lng,
    destination_address: body.destination_address,
    destination_lat: body.destination_lat,
    destination_lng: body.destination_lng,
    distance_km: body.distance_km,
    duration_minutes: body.duration_minutes,
    van_size: body.van_size,
    num_deliverers: body.num_deliverers,
    scheduled_date: body.scheduled_date,
    scheduled_slot: body.scheduled_slot,
    items: body.items,
    access_origin: body.access_origin,
    access_destination: body.access_destination,
    pickup_floors: body.pickup_floors,
    dropoff_floors: body.dropoff_floors,
    handling_option: body.handling_option,
    handling_minutes: body.handling_minutes,
    price_client: body.price_client,
    customer_email: body.customer_email,
    customer_phone: body.customer_phone,
    customer_first_name: body.customer_first_name,
    customer_last_name: body.customer_last_name,
    stripe_payment_intent_id: body.stripe_payment_intent_id,
    // Toujours forcés côté serveur, jamais pris du body
    status: "pending",
    payment_status: "authorized",
  };

  const { data, error } = await supabase
    .from("missions")
    .insert(mission)
    .select("id")
    .single();

  if (error) {
    // Si la DB échoue, on annule le PaymentIntent pour libérer l'autorisation bancaire
    if (mission.stripe_payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(mission.stripe_payment_intent_id);
      } catch (_) {
        // Best effort — on logge mais on ne bloque pas la réponse d'erreur
        console.error("Impossible d'annuler le PaymentIntent:", mission.stripe_payment_intent_id);
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Envoi email de confirmation (best effort — n'échoue pas la requête)
  try {
    const { subject, html } = buildMissionConfirmationEmail({
      missionId: data.id,
      firstName: mission.customer_first_name,
      lastName: mission.customer_last_name,
      email: mission.customer_email,
      phone: mission.customer_phone,
      originAddress: mission.origin_address,
      destinationAddress: mission.destination_address,
      scheduledDate: mission.scheduled_date,
      scheduledSlot: mission.scheduled_slot,
      vanSize: mission.van_size,
      numDeliverers: mission.num_deliverers,
      priceClient: mission.price_client,
      handlingOption: mission.handling_option,
    });

    await resend.emails.send({
      from: "Livrizi <contact@livrizi.fr>",
      to: mission.customer_email,
      subject,
      html,
    });
  } catch (emailError) {
    console.error("Erreur envoi email confirmation:", emailError);
  }

  return NextResponse.json({ id: data.id });
}
