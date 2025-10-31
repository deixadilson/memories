<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Profile, PeriodWithVisibility, MemoryComplete, FriendshipStatus } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const loggedInUser = useSupabaseUser();
const { open: openMemoryModal } = useMemoryModal();
const { getFriendshipStatus } = useFriendship();

const viewState = ref<'periods-list' | 'period-details'>('periods-list');
const loadingProfile = ref(true);
const loadingMemories = ref(true);
const loadingAction = ref(false);
const profile = ref<Profile | null>(null);
const periods = ref<PeriodWithVisibility[]>([]);
const selectedPeriod = ref<PeriodWithVisibility | null>(null);
const memoriesForPeriod = ref<MemoryComplete[]>([]);
const friendshipStatus = ref<FriendshipStatus | 'self'>('not_friends');
const stats = ref({ memories: 0, followers: 0, following: 0 });

async function fetchData() {
  const username = route.params.username as string;
  if (!loggedInUser.value) return;

  loadingProfile.value = true;
  const { data: profileData, error: profileError } = await client
    .rpc('get_profile_by_username', { username_text: username })
    .single();

  if (profileError || !profileData) {
    toast.error('Perfil não encontrado.');
    loadingProfile.value = false;
    return navigateTo('/dashboard');
  }
  profile.value = profileData;

  if (profileData.id === loggedInUser.value?.sub) {
    friendshipStatus.value = 'self';
  } else {
    const { data: relationships } = await client
      .from('friendships')
      .select('*')
      .or(
        `and(requester_id.eq.${loggedInUser.value.sub},receiver_id.eq.${profileData.id}),` +
        `and(requester_id.eq.${profileData.id},receiver_id.eq.${loggedInUser.value.sub})`
      );

    friendshipStatus.value = getFriendshipStatus(loggedInUser.value.sub, relationships || [], profileData.id);
  }
  
  const [memoriesCount, followersCount, followingCount] = await Promise.all([
    client.rpc('count_visible_memories', { profile_id_param: profileData.id }),
    client.from('friendships').select('*', { count: 'exact', head: true }).eq('receiver_id', profileData.id).eq('status', 'accepted'),
    client.from('friendships').select('*', { count: 'exact', head: true }).eq('requester_id', profileData.id).eq('status', 'accepted')
  ]);
  
  stats.value = {
    memories: memoriesCount.data ?? 0,
    followers: followersCount?.count ?? 0,
    following: followingCount?.count ?? 0,
  };
  
  const { data: periodsData, error: periodsError } = await client
    .rpc('get_visible_periods', { profile_id_param: profileData.id });
  
  if (periodsError) toast.error("Erro ao carregar períodos.");
  periods.value = periodsData || [];
  loadingProfile.value = false;
}

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

async function selectPeriod(period: PeriodWithVisibility) {
  selectedPeriod.value = period;
  memoriesForPeriod.value = [];
  viewState.value = 'period-details';

  loadingMemories.value = true;
  const { data: memoriesData, error: memoriesError } = await client
    .rpc('get_visible_memories', {
      profile_id_param: profile.value!.id,
      start_date_filter: period.start_date,
      end_date_filter: period.end_date || undefined,
    });
  
    if (memoriesError) toast.error("Erro ao carregar memórias do período.");
    memoriesForPeriod.value = (memoriesData || []).map(m => ({
      ...m,
      profiles: profile.value
    })) as MemoryComplete[];

  loadingMemories.value = false;
}

function backToPeriodsList() {
  selectedPeriod.value = null;
  memoriesForPeriod.value = [];
  viewState.value = 'periods-list';
}

onMounted(fetchData);
</script>

<template>
  <div v-if="loadingProfile" class="loading-state"><Icon name="lucide:loader-circle" class="spinner" /><span>Carregando perfil...</span></div>
  <div v-else-if="profile">
    <ProfileHeader :profile="profile" :status="friendshipStatus" :loading="loadingAction" @action="handleAction" :stats="stats" />
    
    <div v-if="viewState === 'periods-list'">
      <h2 class="section-title">Períodos de Vida</h2>
      <div v-if="periods.length > 0" class="periods-grid">
        <div v-for="period in periods" :key="period.id" @click="selectPeriod(period)" class="card-wrapper">
          <PeriodCard :period="period" />
        </div>
      </div>
      <EmptyState v-else icon="lucide:image-off" title="Nenhum período encontrado." :message="`${profile.username} não registrou nenhum período público.`"></EmptyState>
    </div>

    <div v-if="viewState === 'period-details' && selectedPeriod">
      <button @click="backToPeriodsList" class="back-link">
        <Icon name="lucide:arrow-left" />
        Voltar para todos os Períodos
      </button>
      <PeriodDetailCard :period="selectedPeriod" />
      <h2 class="section-title">Memórias deste período ({{ memoriesForPeriod.length }})</h2>
      <div v-if="loadingMemories" class="loading-state"><Icon name="lucide:loader-circle" class="spinner" /><span>Carregando memórias...</span></div>
      <div v-else-if="memoriesForPeriod.length > 0" class="memories-grid">
        <div v-for="(memory, index) in memoriesForPeriod" :key="memory.id" @click="openMemoryModal(memoriesForPeriod, index)" class="card-wrapper">
          <MemoryCard :memory="memory" />
        </div>
      </div>
      <EmptyState v-else icon="lucide:image-off" title="Nenhuma memória encontrada." :message="`${profile.username} não registrou memórias públicas neste período.`"></EmptyState>
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
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
.memories-section {
  margin-top: 2rem;
}
.memories-grid {
  display: grid;
  gap: 1.5rem;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .periods-grid, .memories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .periods-grid, .memories-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>