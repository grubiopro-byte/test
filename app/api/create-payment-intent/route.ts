import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    // Montant en centimes (Stripe utilise les centimes)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      capture_method: "manual", // EMPREINTE BANCAIRE : autorise sans débiter
      automatic_payment_methods: {
        enabled: true, // Active carte + Apple Pay + Google Pay automatiquement
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Erreur création PaymentIntent:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
