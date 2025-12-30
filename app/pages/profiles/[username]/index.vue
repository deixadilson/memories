<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';
import type { Profile, PeriodWithVisibility, FriendshipStatus, ProfilePageDetails } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const loggedInUser = useSupabaseUser();

const loadingProfile = ref(true);
const loadingAction = ref(false);
const profile = ref<Profile | null>(null);
const periods = ref<PeriodWithVisibility[]>([]);
const friendshipStatus = ref<FriendshipStatus | 'self'>('not_friends');
const stats = ref({ memories: 0, followers: 0, following: 0 });

async function fetchData() {
  const username = route.params.username as string;
  loadingProfile.value = true;

  try {
    const { data, error } = await client
      .rpc('get_public_profile_page_details', {
        p_username: username,
        p_visitor_id: loggedInUser.value?.sub,
      })
      .single() as PostgrestSingleResponse<ProfilePageDetails>;

    if (error) throw error;
    if (!data) throw new Error('Perfil não encontrado.');

    profile.value = data.profile;
    stats.value = data.stats;
    periods.value = data.periods;
    friendshipStatus.value = data.friendship_status;

  } catch (error: any) {
    toast.error(error.message);
    navigateTo('/dashboard');
  } finally {
    loadingProfile.value = false;
  }
}

const filters = ref({
  search: '',
  category: 'all',
  sort: 'newest' as 'newest' | 'oldest'
});

const periodCategories = [
  { label: 'Educação', value: 'education', icon: 'lucide:graduation-cap' },
  { label: 'Carreira', value: 'work', icon: 'lucide:briefcase' },
  { label: 'Relacionamento', value: 'relationship', icon: 'lucide:heart' },
  { label: 'Residência', value: 'residence', icon: 'lucide:home' },
  { label: 'Viagem', value: 'travel', icon: 'lucide:plane' },
  { label: 'Projeto', value: 'project', icon: 'lucide:code' },
  { label: 'Outro', value: 'other', icon: 'lucide:calendar' },
];

const filteredPeriods = computed(() => {
  let result = [...periods.value];

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.description?.toLowerCase().includes(search) ||
      p.location?.toLowerCase().includes(search)
    );
  }

  if (filters.value.category !== 'all') {
    result = result.filter(p => p.type === filters.value.category);
  }

  result.sort((a, b) => {    
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    
    return filters.value.sort === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return result;
});

async function handleAction(action: 'follow' | 'unfollow' | 'cancel_request' | 'accept' | 'reject' | 'block' | 'unblock') {
  if (!loggedInUser.value || !profile.value || loadingAction.value) return;
  
  loadingAction.value = true;
  const loggedInUserId = loggedInUser.value.sub;
  const otherUserId = profile.value.id;

  try {
    let error: any;
    switch (action) {
      case 'follow':
        ({ error } = await client.from('friendships').insert({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'pending' }));
        if (error) throw error;
        toast.success('Enviada solicitação para seguir.');
        break;

      case 'unfollow':
      case 'cancel_request':
        ({ error } = await client.from('friendships').delete().match({ requester_id: loggedInUserId, receiver_id: otherUserId }));
        if (error) throw error;
        toast.success(action === 'unfollow' ? 'Você deixou de seguir.' : 'Solicitação cancelada.');
        break;

      case 'accept':
        ({ error } = await client.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).match({ requester_id: otherUserId, receiver_id: loggedInUserId }));
        if (error) throw error;
        toast.success('Solicitação aceita!');
        break;
      
      case 'reject':
        ({ error } = await client.from('friendships').delete().match({ requester_id: otherUserId, receiver_id: loggedInUserId }));
        if (error) throw error;
        toast.success('Solicitação rejeitada.');
        break;

      case 'block':
        ({ error } = await client.from('friendships').upsert({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'blocked' }));
        if (error) throw error;
        toast.success('Usuário bloqueado.');
        break;

      case 'unblock':
        ({ error } = await client.from('friendships').delete().match({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'blocked' }));
        if (error) throw error;
        toast.success('Usuário desbloqueado.');
        break;
    }
    await fetchData();
  } catch (error: any) {
    toast.error('Ocorreu um erro: ' + error.message);
  } finally {
    loadingAction.value = false;
  }
}

function selectPeriod(period: PeriodWithVisibility) {
  navigateTo(`/@${profile.value?.username}/period/${period.id}`);
}

onMounted(fetchData);
</script>

<template>
  <div v-if="loadingProfile" class="loading-state"><Icon name="lucide:loader-circle" class="spinner" /><span>Carregando perfil...</span></div>
  <div v-else-if="profile">
    <ProfileHeader :logged-in-user="loggedInUser"  :profile="profile" :status="friendshipStatus" :stats="stats" :loading="loadingAction" @action="handleAction" />
    
    <div>
      <h2 class="section-title">Períodos de Vida</h2>
      
      <ListFilters
        type="periods"
        placeholder="Buscar períodos..."
        :categories="periodCategories"
        v-model="filters"
      />

      <div v-if="filteredPeriods.length > 0" class="periods-grid">
        <div v-for="period in filteredPeriods" :key="period.id" @click="selectPeriod(period)" class="card-wrapper">
          <PeriodCard :period="period" />
        </div>
      </div>
      <EmptyState v-else-if="periods.length > 0"
        icon="lucide:search-x"
        title="Nenhum período encontrado"
        message="Tente ajustar sua busca ou filtros para encontrar o que procura."
      >
        <button @click="filters = { search: '', category: 'all', sort: 'newest' }" class="btn secondary">
          Limpar Filtros
        </button>
      </EmptyState>
      <EmptyState v-else icon="lucide:image-off" title="Nenhum período encontrado." :message="`${profile.username} não registrou nenhum período público.`"></EmptyState>
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  cursor: pointer;
}
.periods-grid {
  display: grid;
  gap: 1.5rem;
}
.periods-grid .card {
  transition: all 0.2s ease-in-out;
}
.periods-grid .selected {
  transform: translateY(-5px);
  box-shadow: 0 0 0 3px hsl(var(--gold)), var(--shadow-card);
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .periods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .periods-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>