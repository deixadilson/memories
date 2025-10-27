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
const actingUserId = ref<string | null>(null);
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

function getRelationshipStatus(otherUserId: string): FriendshipStatus {
  if (!user.value) return 'not_friends';
  const iFollowThem = relationships.value.find(f => f.requester_id === user.value!.sub && f.receiver_id === otherUserId);
  const theyFollowMe = relationships.value.find(f => f.requester_id === otherUserId && f.receiver_id === user.value!.sub);
  if (iFollowThem?.status === 'blocked') return 'blocked';
  if (theyFollowMe?.status === 'blocked') return 'not_friends';
  if (iFollowThem?.status === 'accepted') return 'following';
  if (theyFollowMe?.status === 'accepted') return 'follower_only';
  if (iFollowThem?.status === 'pending') return 'request_sent';
  if (theyFollowMe?.status === 'pending') return 'request_received';
  return 'not_friends';
}

const usersWithStatus = computed(() => {
  return profiles.value
    .map(p => ({ ...p, status: getRelationshipStatus(p.id) }))
    .filter(p => {
      const theirRelationshipWithMe = relationships.value.find(f => f.requester_id === p.id && f.receiver_id === user.value!.sub);
      return theirRelationshipWithMe?.status !== 'blocked';
    });
});

const following = computed(() => usersWithStatus.value.filter(u => u.status === 'following'));
const followers = computed(() => usersWithStatus.value.filter(u => u.status === 'follower_only' || u.status === 'request_received'));

async function handleAction(otherUserId: string, action: 'follow' | 'unfollow' | 'cancel_request' | 'accept' | 'reject' | 'block' | 'unblock') {
  if (!user.value || actingUserId.value) return;
  
  const loggedInUserId = user.value.sub;
  actingUserId.value = otherUserId;
  try {
    let error: any;
    switch (action) {
      case 'follow':
        ({ error } = await client.from('friendships').insert({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'accepted' }));
        if (error) throw error;
        relationships.value.push({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'pending', created_at: new Date().toISOString(), id: '', updated_at: null });
        toast.success('Enviada solicitação para seguir.');
        break;

      case 'unfollow':
      case 'cancel_request':
        ({ error } = await client.from('friendships').delete().match({ requester_id: loggedInUserId, receiver_id: otherUserId }));
        if (error) throw error;
        relationships.value = relationships.value.filter(f => !(f.requester_id === loggedInUserId && f.receiver_id === otherUserId));
        toast.success(action === 'unfollow' ? 'Você deixou de seguir.' : 'Solicitação cancelada.');
        break;

      case 'accept':
        ({ error } = await client.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).match({ requester_id: otherUserId, receiver_id: loggedInUserId }));
        if (error) throw error;
        const relToAccept = relationships.value.find(f => f.requester_id === otherUserId && f.receiver_id === loggedInUserId);
        if (relToAccept) relToAccept.status = 'accepted';
        toast.success('Solicitação aceita!');
        break;
      
      case 'reject':
        ({ error } = await client.from('friendships').delete().match({ requester_id: otherUserId, receiver_id: loggedInUserId }));
        if (error) throw error;
        relationships.value = relationships.value.filter(f => !(f.requester_id === otherUserId && f.receiver_id === loggedInUserId));
        toast.success('Solicitação rejeitada.');
        break;

      case 'block':
        ({ error } = await client.from('friendships').upsert({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'blocked' }));
        if (error) throw error;
        const relToBlock = relationships.value.find(f => f.requester_id === loggedInUserId && f.receiver_id === otherUserId);
        if (relToBlock) relToBlock.status = 'blocked';
        else relationships.value.push({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'blocked', created_at: new Date().toISOString(), id: '', updated_at: null });
        toast.success('Usuário bloqueado.');
        break;

      case 'unblock':
        ({ error } = await client.from('friendships').delete().match({ requester_id: loggedInUserId, receiver_id: otherUserId, status: 'blocked' }));
        if (error) throw error;
        relationships.value = relationships.value.filter(f => !(f.requester_id === loggedInUserId && f.receiver_id === otherUserId));
        toast.success('Usuário desbloqueado.');
        break;
    }
  } catch (error: any) {
    toast.error('Ocorreu um erro: ' + error.message);
  } finally {
    actingUserId.value = null;
  }
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
      <PeopleSearch v-if="activeTab === 'users'" :users="usersWithStatus" :acting-user-id="actingUserId" @action="handleAction" />
      <FollowingList v-if="activeTab === 'following'" :users="following" :acting-user-id="actingUserId" />
      <FollowersList v-if="activeTab === 'followers'" :users="followers" :acting-user-id="actingUserId" />
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
