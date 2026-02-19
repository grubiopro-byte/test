interface MissionEmailData {
  missionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  originAddress: string;
  destinationAddress: string;
  scheduledDate: string;
  scheduledSlot: string;
  vanSize: string;
  numDeliverers: number;
  priceClient: number;
  handlingOption: string;
}

function formatVanSize(van: string): string {
  if (van === "6m3") return "Fourgon 6m³";
  if (van === "11m3") return "Fourgon 11m³";
  if (van === "20m3") return "Grand fourgon 20m³";
  return van;
}

function formatHandling(option: string): string {
  if (option === "express") return "Express (incluse)";
  if (option === "prolongee") return "Prolongée +1h";
  if (option === "prolongee_plus") return "Prolongée +2h";
  if (option === "prolongee_max") return "Prolongée +3h";
  return option;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildMissionConfirmationEmail(data: MissionEmailData): {
  subject: string;
  html: string;
} {
  const subject = `Livrizi – Réservation confirmée #${data.missionId.slice(0, 8).toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F7F8;font-family:Inter,system-ui,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:26px;font-weight:800;color:#3D4BA3;letter-spacing:-0.5px;">Livrizi</span>
            </td>
          </tr>

          <!-- Card principale -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #EDEEF1;padding:36px 32px;">

              <!-- Icône check + titre -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="width:60px;height:60px;background:rgba(61,75,163,0.08);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                      <span style="font-size:28px;">✓</span>
                    </div>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Réservation confirmée !</h1>
                    <p style="margin:8px 0 0;font-size:14px;color:#6B7280;">
                      Bonjour ${data.firstName}, votre transport a bien été enregistré.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- N° de mission -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(61,75,163,0.06);border-radius:10px;padding:14px 18px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#9CA3AF;">Numéro de mission</p>
                    <p style="margin:0;font-size:15px;font-family:monospace;font-weight:600;color:#3D4BA3;">${data.missionId}</p>
                  </td>
                </tr>
              </table>

              <!-- Détails trajet -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td colspan="2" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#9CA3AF;">Détails du transport</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #F3F4F6;vertical-align:top;">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;">Départ</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111827;">${data.originAddress}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #F3F4F6;vertical-align:top;">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;">Arrivée</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111827;">${data.destinationAddress}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #F3F4F6;">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;">Date & créneau</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111827;">${formatDate(data.scheduledDate)} · ${data.scheduledSlot}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #F3F4F6;">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;">Véhicule</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111827;">${formatVanSize(data.vanSize)} · ${data.numDeliverers} livrizeur${data.numDeliverers > 1 ? "s" : ""}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #F3F4F6;">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;">Manutention</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111827;">${formatHandling(data.handlingOption)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #F3F4F6;border-bottom:1px solid #F3F4F6;">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;">Montant autorisé</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#111827;">${data.priceClient.toFixed(2).replace(".", ",")} €</p>
                  </td>
                </tr>
              </table>

              <!-- Note paiement -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#166534;">
                      🔒 Votre carte a été <strong>pré-autorisée</strong> mais <strong>aucun débit</strong> n'a eu lieu. Vous ne serez débité qu'à la fin de la prestation.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Prochaines étapes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#9CA3AF;">Prochaines étapes</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#374151;">1. Un livrizeur vous sera attribué sous peu.</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#374151;">2. Vous recevrez une confirmation avec ses coordonnées.</p>
                    <p style="margin:0;font-size:14px;color:#374151;">3. Le jour J, votre livrizeur vous contacte avant d'arriver.</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">Une question ? Contactez-nous à <a href="mailto:contact@livrizi.fr" style="color:#3D4BA3;text-decoration:none;">contact@livrizi.fr</a></p>
              <p style="margin:6px 0 0;font-size:11px;color:#D1D5DB;">Livrizi · Transport & déménagement</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  return { subject, html };
}
