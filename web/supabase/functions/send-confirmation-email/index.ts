// Supabase Edge Function: Send Upload Confirmation Email
// Trigger: After successful data upload (memory/tribute)
// URL: https://[project-ref].supabase.co/functions/v1/send-confirmation-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface ConfirmationEmailRequest {
  email: string;
  name?: string;
  itemType: 'memory' | 'tribute' | 'collection' | 'memorial';
  itemName: string;
  uploadTime: string;
}

const confirmationEmailTemplate = (data: ConfirmationEmailRequest) => {
  const itemTypeText = {
    'memory': 'Erinnerung',
    'tribute': 'Tribute',
    'collection': 'Sammlung',
    'memorial': 'Memorial'
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bestätigung - Daten gespeichert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; background-color: #050505;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Success Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #001a00 0%, #0a2d0a 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(34, 197, 94, 0.3);">
              <div style="width: 60px; height: 60px; background-color: rgba(34, 197, 94, 0.2); border: 2px solid #22C55E; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #22C55E; font-size: 24px; font-weight: 900; letter-spacing: 0.05em;">
                ERFOLGREICH GESPEICHERT
              </h1>
              <p style="margin: 10px 0 0; color: #E5E4E2; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
                Deine Daten sind sicher
              </p>
            </td>
          </tr>

          <!-- Confirmation Message -->
          <tr>
            <td style="padding: 40px; color: #ffffff;">
              <p style="margin: 0 0 20px; color: #E5E4E2; font-size: 16px; line-height: 1.6;">
                Hallo ${data.name || 'dort'},
              </p>
              
              <p style="margin: 0 0 30px; color: #cccccc; font-size: 15px; line-height: 1.6;">
                Deine <strong style="color: #D4AF37;">${itemTypeText[data.itemType]}</strong> wurde erfolgreich in unserem sicheren Vault gespeichert.
              </p>

              <!-- Upload Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; margin: 0 0 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                          Typ:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">
                          ${itemTypeText[data.itemType]}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          Name:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          ${data.itemName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          Zeitpunkt:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          ${data.uploadTime}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="background-color: rgba(212, 175, 55, 0.05); border-left: 4px solid #D4AF37; padding: 20px; margin: 0 0 30px; border-radius: 4px;">
                <p style="margin: 0; color: #E5E4E2; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #D4AF37;">🔒 Sicherheit garantiert:</strong><br>
                  Deine Daten sind verschlüsselt und werden in unserem sicheren Vault (Supabase) gespeichert. Nur du hast Zugriff auf deine persönlichen Inhalte.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://rememberedapp.io/app.html" style="display: inline-block; background-color: #22C55E; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);">
                  Zur App
                </a>
              </div>

              <p style="margin: 30px 0 0; color: #666666; font-size: 13px; line-height: 1.6; text-align: center;">
                Möchtest du weitere Erinnerungen hinzufügen?<br>
                Öffne die App und erstelle dein persönliches Vermächtnis.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000000; padding: 30px 40px; border-top: 1px solid rgba(34, 197, 94, 0.2);">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px; text-align: center;">
                © 2026 Remembered App. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; color: #666666; font-size: 11px; text-align: center;">
                system@rememberedapp.io
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: ConfirmationEmailRequest = await req.json();

    if (!data.email || !data.itemType || !data.itemName) {
      return new Response(
        JSON.stringify({ error: 'Email, itemType, and itemName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'system@rememberedapp.io',
        to: [data.email],
        subject: '✓ Deine Daten sind sicher gespeichert - Remembered',
        html: confirmationEmailTemplate(data),
      }),
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: responseData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: responseData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
