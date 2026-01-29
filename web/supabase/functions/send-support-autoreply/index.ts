// Supabase Edge Function: Send Support Auto-Reply
// Trigger: After contact form submission
// URL: https://[project-ref].supabase.co/functions/v1/send-support-autoreply

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface SupportAutoReplyRequest {
  email: string;
  name?: string;
  subject: string;
  ticketId?: string;
}

const supportAutoReplyTemplate = (data: SupportAutoReplyRequest) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Anfrage erhalten</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; background-color: #050505;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Support Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #001a3d 0%, #0a2d5c 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(59, 130, 246, 0.3);">
              <div style="width: 60px; height: 60px; background-color: rgba(59, 130, 246, 0.2); border: 2px solid #3B82F6; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">💬</span>
              </div>
              <h1 style="margin: 0; color: #3B82F6; font-size: 24px; font-weight: 900; letter-spacing: 0.05em;">
                ANFRAGE ERHALTEN
              </h1>
              <p style="margin: 10px 0 0; color: #E5E4E2; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
                Wir melden uns in Kürze
              </p>
            </td>
          </tr>

          <!-- Auto-Reply Message -->
          <tr>
            <td style="padding: 40px; color: #ffffff;">
              <p style="margin: 0 0 20px; color: #E5E4E2; font-size: 16px; line-height: 1.6;">
                Hallo ${data.name || 'dort'},
              </p>
              
              <p style="margin: 0 0 30px; color: #cccccc; font-size: 15px; line-height: 1.6;">
                Vielen Dank für deine Nachricht an <strong style="color: #D4AF37;">Remembered Support</strong>. Wir haben deine Anfrage erhalten und werden uns schnellstmöglich bei dir melden.
              </p>

              <!-- Request Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; margin: 0 0 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${data.ticketId ? `
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                          Ticket-ID:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-family: monospace;">
                          ${data.ticketId}
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; ${data.ticketId ? 'border-top: 1px solid rgba(255, 255, 255, 0.05);' : ''}">
                          Betreff:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; ${data.ticketId ? 'border-top: 1px solid rgba(255, 255, 255, 0.05);' : ''}">
                          ${data.subject}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          Antwortzeit:
                        </td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                          Innerhalb 24-48h
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="background-color: rgba(212, 175, 55, 0.05); border-left: 4px solid #D4AF37; padding: 20px; margin: 0 0 30px; border-radius: 4px;">
                <p style="margin: 0; color: #E5E4E2; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #D4AF37;">📧 Was passiert als Nächstes?</strong><br>
                  Unser Support-Team prüft deine Anfrage und wird sich per E-Mail bei dir melden. In dringenden Fällen antworten wir innerhalb weniger Stunden.
                </p>
              </div>

              <!-- FAQ Section -->
              <div style="margin: 30px 0;">
                <p style="margin: 0 0 15px; color: #999999; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                  Häufige Fragen:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #cccccc; font-size: 14px; line-height: 1.8;">
                  <li><a href="https://rememberedapp.io/help/account" style="color: #3B82F6; text-decoration: none;">Account & Login-Probleme</a></li>
                  <li><a href="https://rememberedapp.io/help/subscription" style="color: #3B82F6; text-decoration: none;">Mitgliedschaft & Abrechnung</a></li>
                  <li><a href="https://rememberedapp.io/help/privacy" style="color: #3B82F6; text-decoration: none;">Datenschutz & Sicherheit</a></li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://rememberedapp.io/help" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
                  Hilfe-Center
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000000; padding: 30px 40px; border-top: 1px solid rgba(59, 130, 246, 0.2);">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px; text-align: center;">
                © 2026 Remembered App. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; color: #666666; font-size: 11px; text-align: center;">
                support@rememberedapp.io
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
    const data: SupportAutoReplyRequest = await req.json();

    if (!data.email || !data.subject) {
      return new Response(
        JSON.stringify({ error: 'Email and subject are required' }),
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
        from: 'support@rememberedapp.io',
        to: [data.email],
        subject: 'Wir haben deine Anfrage erhalten - Remembered Support',
        html: supportAutoReplyTemplate(data),
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
    console.error('Error sending support auto-reply:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
