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
.card-wrapper {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  cursor: pointer;
}
.memories-grid {
  display: block;
  column-count: 1;
  column-gap: 1.5rem;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .memories-grid {
    column-count: 2;
  }
}
@media (min-width: 1024px) {
  .memories-grid {
    column-count: 3;
  }
}
</style>
