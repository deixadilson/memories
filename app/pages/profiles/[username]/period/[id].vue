<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';
import type { Profile, PeriodWithVisibility, MemoryComplete, FriendshipStatus, ProfilePageDetails } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const loggedInUser = useSupabaseUser();
const { open: openMemoryModal } = useMemoryModal();

const loadingProfile = ref(true);
const loadingMemories = ref(false);
const loadingAction = ref(false);
const profile = ref<Profile | null>(null);
const period = ref<PeriodWithVisibility | null>(null);
const memoriesForPeriod = ref<MemoryComplete[]>([]);
const friendshipStatus = ref<FriendshipStatus | 'self'>('not_friends');
const stats = ref({ memories: 0, followers: 0, following: 0 });

async function fetchData() {
  const username = route.params.username as string;
  const periodId = route.params.id as string;
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
    friendshipStatus.value = data.friendship_status;

    const foundPeriod = data.periods.find(p => p.id === periodId);
    if (!foundPeriod) throw new Error('Período não encontrado.');
    period.value = foundPeriod;

    await fetchMemories(foundPeriod);

  } catch (error: any) {
    toast.error(error.message);
    navigateTo(`/@${username}`);
  } finally {
    loadingProfile.value = false;
  }
}

async function fetchMemories(period: PeriodWithVisibility) {
    loadingMemories.value = true;
    const { data: memoriesData, error: memoriesError } = await client
    .rpc('get_visible_memories', {
      profile_id: profile.value!.id,
      visitor_id: loggedInUser.value?.sub,
      start_date: period.start_date,
      end_date: period.end_date || undefined,
    });
  
    if (memoriesError) toast.error("Erro ao carregar memórias do período.");
    memoriesForPeriod.value = (memoriesData || []).map(m => ({
      ...m,
      profiles: profile.value
    })) as MemoryComplete[];

  loadingMemories.value = false;
}

const filters = ref({
  search: '',
  category: 'all',
  sort: 'newest' as 'newest' | 'oldest'
});

const memoryCategories = [
  { label: 'Viagem', value: 'travel', icon: 'lucide:plane' },
  { label: 'Educação', value: 'education', icon: 'lucide:graduation-cap' },
  { label: 'Família', value: 'family', icon: 'lucide:users' },
  { label: 'Carreira', value: 'work', icon: 'lucide:briefcase' },
  { label: 'Pessoal', value: 'personal', icon: 'lucide:user' },
  { label: 'Conquista', value: 'milestone', icon: 'lucide:award' },
  { label: 'Outro', value: 'other', icon: 'lucide:shapes' },
];

const filteredMemories = computed(() => {
  let result = [...memoriesForPeriod.value];

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(m => 
      m.title.toLowerCase().includes(search) || 
      m.description?.toLowerCase().includes(search) ||
      m.location?.toLowerCase().includes(search)
    );
  }

  if (filters.value.category !== 'all') {
    result = result.filter(m => m.category === filters.value.category);
  }

  result.sort((a, b) => {    
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
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

onMounted(fetchData);
</script>

<template>
  <div v-if="loadingProfile" class="loading-state"><Icon name="lucide:loader-circle" class="spinner" /><span>Carregando perfil...</span></div>
  <div v-else-if="profile && period">
    <ProfileHeader :logged-in-user="loggedInUser"  :profile="profile" :status="friendshipStatus" :stats="stats" :loading="loadingAction" @action="handleAction" />
    
    <div>
      <NuxtLink :to="`/@${profile.username}`" class="back-link">
        <Icon name="lucide:arrow-left" />
        Voltar para todos os Períodos
      </NuxtLink>
      <PeriodDetailCard :period="period" />
      <ListFilters
        type="memories"
        placeholder="Buscar memórias..."
        :categories="memoryCategories"
        v-model="filters"
      />

      <div v-if="loadingMemories" class="loading-state"><Icon name="lucide:loader-circle" class="spinner" /><span>Carregando memórias...</span></div>
      <div v-else-if="filteredMemories.length > 0">
        <MasonryGrid :items="filteredMemories" v-slot="{ item, index }">
          <div @click="openMemoryModal(filteredMemories, index)" class="memory-wrapper">
            <MemoryCard :memory="item" />
          </div>
        </MasonryGrid>
      </div>
      <EmptyState v-else-if="memoriesForPeriod.length > 0"
        icon="lucide:search-x"
        title="Nenhuma memória encontrada"
        message="Tente ajustar sua busca ou filtros para encontrar o que procura."
      >
        <button @click="filters = { search: '', category: 'all', sort: 'newest' }" class="btn secondary">
          Limpar Filtros
        </button>
      </EmptyState>
      <EmptyState v-else icon="lucide:image-off" title="Nenhuma memória encontrada." :message="`${profile.username} não registrou memórias públicas neste período.`"></EmptyState>
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;
  transition: color 0.2s;
}
.back-link:hover {
  color: hsl(var(--foreground));
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.memory-wrapper {
  cursor: pointer;
}

</style>
