<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Profile, Period, MemoryWithAuthor, FriendshipStatus } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const loggedInUser = useSupabaseUser();
const { open: openMemoryModal } = useMemoryModal();

const viewState = ref<'periods-list' | 'period-details'>('periods-list');
const loadingProfile = ref(true);
const loadingMemories = ref(true);
const profile = ref<Profile | null>(null);
const periods = ref<Period[]>([]);
const selectedPeriod = ref<Period | null>(null);
const memoriesForPeriod = ref<MemoryWithAuthor[]>([]);
const friendshipStatus = ref<FriendshipStatus | 'self'>('not_friends');
const stats = ref({ memories: 0, followers: 0, following: 0 });

async function fetchData() {
  const username = route.params.username as string;

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

  const [memoriesCount, followersCount, followingCount] = await Promise.all([
    client.from('memories').select('*', { count: 'exact', head: true }).eq('user_id', profileData.id).eq('visibility', 'public'),
    client.from('friendships').select('*', { count: 'exact', head: true }).eq('receiver_id', profileData.id).eq('status', 'accepted'),
    client.from('friendships').select('*', { count: 'exact', head: true }).eq('requester_id', profileData.id).eq('status', 'accepted')
  ]);

  if (profileData.id === loggedInUser.value?.sub) {
    friendshipStatus.value = 'self';
  } else {
    const { data: friendship } = await client.from('friendships').select('*')
      .or(`(requester_id.eq.${loggedInUser.value?.sub},and(receiver_id.eq.${profileData.id}))`)
      .single();
    if (friendship && friendship.status === 'accepted') {
      friendshipStatus.value = 'following'; 
    } else if (friendship && friendship.status === 'pending') {
      friendshipStatus.value = 'request_sent';
    }
  }

  stats.value = {
    memories: memoriesCount?.count ?? 0,
    followers: followersCount?.count ?? 0,
    following: followingCount?.count ?? 0,
  };

  const { data: periodsData } = await client.from('periods')
    .select('*')
    .eq('user_id', profileData.id)
    .eq('visibility', 'public')
    .order('start_date', { ascending: false });
  
  periods.value = periodsData || [];
  loadingProfile.value = false;
}

async function selectPeriod(period: Period) {
  selectedPeriod.value = period;
  memoriesForPeriod.value = [];
  viewState.value = 'period-details';

  loadingMemories.value = true;
  const query = client.from('memories').select('*, profiles(*)')
    .eq('user_id', profile.value!.id).eq('visibility', 'public')
    .gte('date', period.start_date);
  if (period.end_date) query.lte('date', period.end_date);
  
  const { data } = await query.order('date');
  memoriesForPeriod.value = (data as MemoryWithAuthor[]) || [];
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
    <ProfileHeader :profile="profile" :status="friendshipStatus" :stats="stats" />
    
    <div v-if="viewState === 'periods-list'">
      <h2 class="section-title">Períodos de Vida</h2>
      <div v-if="periods.length > 0" class="periods-grid">
        <div v-for="period in periods" :key="period.id" @click="selectPeriod(period)" class="card-wrapper">
          <PeriodCard :period="period" />
        </div>
      </div>
      <EmptyState v-else icon="lucide:clock" title="Nenhum período encontrado." :message="`${profile.username} não registrou nenhum período público.`"></EmptyState>
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
      <EmptyState v-else icon="lucide:image" title="Nenhuma memória encontrada." :message="`${profile.username} não registrou memórias públicas neste período.`"></EmptyState>
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