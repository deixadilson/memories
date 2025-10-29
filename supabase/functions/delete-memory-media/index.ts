import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

async function deleteMedia(supabaseClient: SupabaseClient, filePaths: string[]) {
  const { data, error } = await supabaseClient.storage
    .from('memories-media')
    .remove(filePaths);

  if (error) {
    throw new Error(`Error removing medias: ${error.message}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { memoryId, urlsToDelete } = await req.json();
    if (!memoryId || !urlsToDelete || urlsToDelete.length === 0) {
      throw new Error('memoryId and urlsToDelete are required.');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthenticated user.');

    const { data: memory, error: memoryError } = await supabaseClient
      .from('memories')
      .select('user_id')
      .eq('id', memoryId)
      .eq('user_id', user.id)
      .single();

    if (memoryError || !memory) {
      throw new Error('Memory not found or permission denied.');
    }

    const filePaths = urlsToDelete.map((url: string) => {
      const parts = new URL(url).pathname.split('/memories-media/');
      return parts[1];
    });

    await deleteMedia(supabaseClient, filePaths);

    return new Response(JSON.stringify({ message: 'Media successfully deleted.' }), {
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
