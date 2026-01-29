// Supabase Edge Function: Send Welcome Email
// Trigger: After user registration
// URL: https://[project-ref].supabase.co/functions/v1/send-welcome-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const welcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei Remembered</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; background-color: #050505;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden;">
          
          <!-- Header with Gold Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3);">
              <h1 style="margin: 0; color: #D4AF37; font-size: 32px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase;">
                REMEMBERED
              </h1>
              <p style="margin: 10px 0 0; color: #E5E4E2; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
                Legends Live Forever
              </p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px; color: #ffffff;">
              <h2 style="margin: 0 0 20px; color: #D4AF37; font-size: 24px; font-weight: 700;">
                Willkommen, ${name}!
              </h2>
              
              <p style="margin: 0 0 20px; color: #E5E4E2; font-size: 16px; line-height: 1.6;">
                Danke, dass du Teil von <strong style="color: #D4AF37;">Remembered</strong> geworden bist – einer Plattform, die Legenden ehrt und Erinnerungen für die Ewigkeit bewahrt.
              </p>

              <p style="margin: 0 0 20px; color: #cccccc; font-size: 15px; line-height: 1.6;">
                Du kannst jetzt:
              </p>

              <ul style="margin: 0 0 30px; padding-left: 20px; color: #cccccc; font-size: 15px; line-height: 1.8;">
                <li>Ikonen entdecken und ihre Geschichten lesen</li>
                <li>Kerzen anzünden und virtuelle Blumen legen</li>
                <li>Deine Favoriten speichern und verwalten</li>
                <li>Teil einer Community werden, die Legenden ehrt</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://rememberedapp.io/app.html" style="display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);">
                  App Öffnen
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000000; padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px; text-align: center;">
                © 2026 Remembered App. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; color: #666666; font-size: 11px; text-align: center;">
                rememberedapp.io
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
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email, name }: WelcomeEmailRequest = await req.json();

    if (!email) {
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

    // Send email via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'welcome@rememberedapp.io',
        to: [email],
        subject: 'Willkommen bei Remembered',
        html: welcomeEmailTemplate(name || 'dort'),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
