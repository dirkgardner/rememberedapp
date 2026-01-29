// Supabase Edge Function: Send Security Alert Email
// Trigger: New device/IP login detection
// URL: https://[project-ref].supabase.co/functions/v1/send-security-alert

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface SecurityAlertRequest {
  email: string;
  name?: string;
  loginTime: string;
  ipAddress: string;
  device: string;
  location?: string;
  userId: string;
}

const securityAlertTemplate = (data: SecurityAlertRequest) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sicherheitswarnung - Neuer Login</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; background-color: #050505;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Security Alert Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a0000 0%, #2d0a0a 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(239, 68, 68, 0.3);">
              <div style="width: 60px; height: 60px; background-color: rgba(239, 68, 68, 0.2); border: 2px solid #EF4444; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🔒</span>
              </div>
              <h1 style="margin: 0; color: #EF4444; font-size: 24px; font-weight: 900; letter-spacing: 0.05em;">
                SICHERHEITSWARNUNG
              </h1>
              <p style="margin: 10px 0 0; color: #E5E4E2; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
                Neuer Login erkannt
              </p>
            </td>
          </tr>

          <!-- Alert Message -->
          <tr>
            <td style="padding: 40px; color: #ffffff;">
              <p style="margin: 0 0 20px; color: #E5E4E2; font-size: 16px; line-height: 1.6;">
                Hallo ${data.name || 'dort'},
              </p>
              
              <p style="margin: 0 0 30px; color: #cccccc; font-size: 15px; line-height: 1.6;">
                Wir haben eine neue Anmeldung in deinem <strong style="color: #D4AF37;">Remembered</strong> Account festgestellt:
              </p>

              <!-- Login Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin: 0 0 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                          Zeitpunkt:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">
                          ${data.loginTime}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          IP-Adresse:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          ${data.ipAddress}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          Gerät:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          ${data.device}
                        </td>
                      </tr>
                      ${data.location ? `
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          Standort:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          ${data.location}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #cccccc; font-size: 15px; line-height: 1.6;">
                <strong style="color: #EF4444;">Warst das nicht du?</strong><br>
                Wenn du diese Anmeldung nicht durchgeführt hast, empfehlen wir dir dringend, dein Passwort sofort zu ändern und deinen Account zu überprüfen.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://rememberedapp.io/settings?action=security" style="display: inline-block; background-color: #EF4444; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); margin-bottom: 12px;">
                  Account Sichern
                </a>
                <br>
                <a href="https://rememberedapp.io/settings" style="display: inline-block; color: #999999; text-decoration: none; padding: 12px 20px; font-size: 13px;">
                  Zu den Einstellungen
                </a>
              </div>

              <p style="margin: 30px 0 0; color: #666666; font-size: 13px; line-height: 1.6; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <strong>War das du?</strong> Dann kannst du diese E-Mail ignorieren. Dein Account ist sicher.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000000; padding: 30px 40px; border-top: 1px solid rgba(239, 68, 68, 0.2);">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px; text-align: center;">
                © 2026 Remembered App. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; color: #666666; font-size: 11px; text-align: center;">
                security@rememberedapp.io
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

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: SecurityAlertRequest = await req.json();

    if (!data.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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
        from: 'security@rememberedapp.io',
        to: [data.email],
        subject: '🔒 Neuer Login erkannt - Remembered',
        html: securityAlertTemplate(data),
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
    console.error('Error sending security alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
