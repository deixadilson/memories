<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Profile, Friendship, FriendshipStatus } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const activeTab = ref('users');
const loading = ref(true);

const profiles = ref<Profile[]>([]);
const relationships = ref<Friendship[]>([]);

const isModalOpen = ref(false);

async function fetchData() {
  if (!user.value) return;

  loading.value = true;
  const [profilesRes, relationshipsRes] = await Promise.all([
    client.from('profiles').select('*').neq('id', user.value.sub),
    client.from('friendships').select('*').or(`requester_id.eq.${user.value.sub},receiver_id.eq.${user.value.sub}`)
  ]);

  if (profilesRes.error || relationshipsRes.error) {
    toast.error('Erro ao carregar os dados.');
  } else {
    profiles.value = profilesRes.data;
    relationships.value = relationshipsRes.data;
  }
  loading.value = false;
}

onMounted(fetchData);

function getRelationshipStatus(userId: string): FriendshipStatus {
  const iFollowThem = relationships.value.find(f => f.requester_id === user.value?.id && f.receiver_id === userId);
  const theyFollowMe = relationships.value.find(f => f.requester_id === userId && f.receiver_id === user.value?.sub);

  const isFollowing = iFollowThem?.status === 'accepted';
  const isFollower = theyFollowMe?.status === 'accepted';

  if (isFollowing && isFollower) return 'mutual';
  if (isFollowing) return 'following';
  if (isFollower) return 'follower_only';

  if (iFollowThem?.status === 'pending') return 'request_sent';
  if (theyFollowMe?.status === 'pending') return 'request_received';
  
  return 'not_friends';
}

const usersWithStatus = computed(() => {
  return profiles.value.map(p => ({
    ...p,
    status: getRelationshipStatus(p.id)
  }));
});

const following = computed(() => usersWithStatus.value.filter(u => u.status === 'following' || u.status === 'mutual'));
const followers = computed(() => usersWithStatus.value.filter(u => u.status === 'follower_only' || u.status === 'mutual'));

async function handleAction(userId: string, action: 'follow' | 'accept' | 'reject' | 'block') {
  if (!user.value) return;

  if (action === 'follow') {
    const { error } = await client.from('friendships').insert({ requester_id: user.value.id, receiver_id: userId });
    if (error) toast.error(error.message); else toast.success('Solicitação enviada!');
  }
  // Adicionar lógica para 'accept', 'reject' e 'block' aqui depois
  
  await fetchData(); // Sempre recarrega os dados após uma ação
}

function handleSuccess() {
  fetchData();
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Pessoas</h1>
        <p>Gerencie as pessoas importantes da sua vida.</p>
      </div>
      <button @click="isModalOpen = true" class="btn primary">
        <Icon name="lucide:plus" />
        Adicionar Pessoa
      </button>
    </div>
    <div class="tabs">
      <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }" class="tab-item">Usuários</button>
      <button @click="activeTab = 'following'" :class="{ active: activeTab === 'following' }" class="tab-item">Seguindo</button>
      <button @click="activeTab = 'followers'" :class="{ active: activeTab === 'followers' }" class="tab-item">Seguidores</button>
      <button @click="activeTab = 'lists'" :class="{ active: activeTab === 'lists' }" class="tab-item">Listas</button>
    </div>

    <div v-if="loading" class="loading-state"><Icon name="lucide:loader-circle" class="spinner"/> Carregando...</div>
    <div v-else>
      <PeopleSearch v-if="activeTab === 'users'" :users="usersWithStatus" @action="handleAction" />
      <FollowingList v-if="activeTab === 'following'" :users="following" />
      <FollowersList v-if="activeTab === 'followers'" :users="followers" />
      <UserLists v-if="activeTab === 'lists'"/>
    </div>

    <Modal :is-open="isModalOpen" title="Adicionar Nova Pessoa" @close="isModalOpen = false">
      <PersonForm @close="isModalOpen = false" @success="handleSuccess" />
    </Modal>
  </div>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%; height: 2.5rem;
  max-width: 38rem;
  color: hsl(var(--muted-foreground));
  background-color: hsl(var(--muted));
  margin-bottom: 2rem;
  padding: .25rem;
  border-radius: calc(var(--radius) - 2px);
}
.tab-item {
  background-color: transparent;
  height: auto;
  padding: .375rem .75rem;
}
.tabs .active {
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);
}
</style>