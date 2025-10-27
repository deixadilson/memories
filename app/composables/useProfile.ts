import type { Database } from '~/types/supabase';
import type { Profile } from '~/types/app';

export const useProfile = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const profile = useState<Profile | null>('profile', () => null);


  const fetchProfile = async (force = false) => {
    if (!user.value) {
      profile.value = null;
      return;
    }
    
    if (profile.value && !force) return;

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value.sub)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      profile.value = null;
    } else {
      profile.value = data;
    }
  };

  const clearProfile = () => {
    profile.value = null;
  };

  return {
    profile,
    fetchProfile,
    clearProfile
  };
};
