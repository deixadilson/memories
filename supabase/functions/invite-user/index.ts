import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, inviterName } = await req.json();
    if (!email) {
      throw new Error('Email is required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
    );

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { inviter: inviterName },
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: `Convite enviado para ${email}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
