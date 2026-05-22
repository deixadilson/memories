<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';
import type { Memory, Profile, MemoryWithAuthor, CommentWithProfile, Like, FriendshipStatus, MemoryPageDetails  } from '~/types/app';
import { useFriendship } from '~/composables/useFriendship';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const loggedInUser = useSupabaseUser();
const { getFriendshipStatus } = useFriendship();

const profile = ref<Profile | null>(null);
const memory = ref<MemoryWithAuthor | null>(null);
const likes = ref<Like[]>([]);
const comments = ref<CommentWithProfile[]>([]);
const friendshipStatus = ref<FriendshipStatus | 'self'>('not_friends');
const stats = ref({ memories: 0, followers: 0, following: 0 });
const liking = ref(false);
const accessDeniedReason = ref<'not_found' | 'permission_denied' | null>(null);

const { data: pageDetails, pending: loading } = await useAsyncData(`memory-page-${route.params.id}`, async () => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const memoryId = route.params.id as string;
  
  const { data, error } = await supabase
    .rpc('get_public_memory_page_details', {
      p_memory_id: memoryId,
      p_visitor_id: user.value?.sub,
    })
    .single() as PostgrestSingleResponse<MemoryPageDetails>;

  if (error) throw error;
  if (!data) return null;

  let commentsData: CommentWithProfile[] = [];
  let likesData: Like[] = [];
  if (data.is_visible) {
    const [commentsRes, likesRes] = await Promise.all([
      supabase.from('comments').select('*, profiles(*)').eq('memory_id', memoryId),
      supabase.from('likes').select('*').eq('memory_id', memoryId),
    ]);
    commentsData = (commentsRes.data as CommentWithProfile[]) || [];
    likesData = (likesRes.data as Like[]) || [];
  }

  let friendship: FriendshipStatus | 'self' = 'not_friends';
  if (user.value && data.profile) {
    if (data.profile.id === user.value.sub) {
      friendship = 'self';
    } else {
      const { data: relationships } = await supabase.from('friendships').select('*').or(`and(requester_id.eq.${user.value.sub},receiver_id.eq.${data.profile.id}),and(requester_id.eq.${data.profile.id},receiver_id.eq.${user.value.sub})`);
      friendship = getFriendshipStatus(user.value.sub, relationships || [], data.profile.id);
    }
  }

  return {
    ...data,
    comments: commentsData,
    likes: likesData,
    friendshipStatus: friendship,
  };
});

watch(pageDetails, (newVal) => {
  if (newVal) {
    profile.value = newVal.profile;
    stats.value = newVal.stats;
    if (newVal.is_visible && newVal.memory) {
      memory.value = { ...newVal.memory as Memory, profiles: newVal.profile };
      comments.value = newVal.comments;
      likes.value = newVal.likes;
      accessDeniedReason.value = null;
    } else {
      accessDeniedReason.value = 'permission_denied';
    }
    friendshipStatus.value = newVal.friendshipStatus;
  } else {
    accessDeniedReason.value = 'not_found';
  }
}, { immediate: true });

useSeoMeta({
  title: () => memory.value ? `${memory.value.title} por ${profile.value?.username}` : 'Memória',
  description: () => memory.value?.description || '',
  ogTitle: () => memory.value ? `${memory.value.title} por ${profile.value?.username}` : 'Memória',
  ogDescription: () => memory.value?.description || '',
  ogImage: () => memory.value?.media_urls?.[0] || profile.value?.avatar_url || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000',
  ogType: 'article',
  twitterCard: 'summary_large_image',
});

const toggleLike = async () => {
  if (!loggedInUser.value || !memory.value || liking.value) return;

  try {
    liking.value = true;

    const { id: memoryId } = memory.value;
    const { sub: userId } = loggedInUser.value;
    const existingLike = likes.value.find(l => l.user_id === userId);

    if (existingLike) {
      likes.value = likes.value.filter(l => l.user_id !== userId);
      const { error } = await client.from('likes').delete().match({ user_id: userId, memory_id: memoryId });
      if (error) {
        toast.error("Erro ao descurtir.");
        likes.value.push(existingLike);
      }
    } else {
      const newLike: Like = { user_id: userId, memory_id: memoryId, created_at: new Date().toISOString() };
      likes.value.push(newLike);
      const { error } = await client.from('likes').insert({ user_id: userId, memory_id: memoryId });
      if (error) {
        toast.error("Erro ao curtir.");
        likes.value = likes.value.filter(l => l.user_id !== userId);
      }
    }
  } catch (e) {
    toast.error("Ocorreu um erro inesperado.");
  } finally {
    liking.value = false;
  }
};

const postComment = async (content: string) => {
  if (!loggedInUser.value || !memory.value) return;

  const { data, error } = await client
    .from('comments')
    .insert({
      user_id: loggedInUser.value.sub,
      memory_id: memory.value.id,
      content: content.trim(),
    })
    .select('*, profiles(*)')
    .single();
  
  if (error) {
    toast.error("Erro ao comentar.");
  }
  else {
    comments.value.push(data);
  }
};
</script>

<template>
  <div v-if="loading" class="loading-state">
    <Icon name="lucide:loader-circle" class="spinner"/>
    Carregando memória...
  </div>
  <div v-else-if="profile && memory && !accessDeniedReason">
    <ProfileHeader :logged-in-user="loggedInUser" :profile="profile" :status="friendshipStatus" :stats="stats" :loading="false"/>
    <NuxtLink :to="`/@${profile.username}`" class="back-link">
      <Icon name="lucide:arrow-left" />
      Perfil de {{ profile.username }}
    </NuxtLink>
    
    <MemoryDetailView
      class="page-view"
      :memory="memory"
      :comments="comments"
      :likes="likes"
      :liking="liking"
      @like="toggleLike"
      @comment="postComment"
    />
  </div>
  <div v-else-if="accessDeniedReason === 'permission_denied' && profile">
    <ProfileHeader :logged-in-user="loggedInUser" :profile="profile" :status="friendshipStatus" :stats="stats" :loading="false"/>
    <EmptyState
      icon="lucide:lock"
      title="Esta é uma memória privada"
      :message="`A memória que você está tentando ver não é pública. Para visualizá-la, você pode precisar seguir ${profile.username} ou fazer parte de uma de suas listas.`"
    >
      <div class="action-buttons">
        <NuxtLink v-if="!loggedInUser" to="/user/login" class="btn primary">
          <Icon name="lucide:log-in" /> Fazer Login
        </NuxtLink>
        <NuxtLink v-if="!loggedInUser" to="/user/register" class="btn secondary">
          <Icon name="lucide:user-plus" />Criar Conta
        </NuxtLink>
      </div>
    </EmptyState>
  </div>

  <div v-else>
    <EmptyState
      icon="lucide:search-x"
      title="Memória não encontrada"
      message="O link que você seguiu pode estar quebrado ou a memória pode ter sido excluída."
    />
  </div>
</template>

<style scoped>
.back-link { margin: 1rem 0; display: inline-flex; }
.page-view {
  display: grid;
  grid-template-columns: 2fr 1fr;
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  margin: 0 auto;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  overflow: hidden;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
@media (max-width: 900px) {
  .page-view { display: flex; flex-direction: column; height: auto; }
}
</style>