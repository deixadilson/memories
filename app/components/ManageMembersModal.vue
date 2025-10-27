<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { UserListWithMembers, FollowerWithMembership } from '~/types/app';

const props = defineProps<{
  isOpen: boolean;
  list: UserListWithMembers | null;
  followers: FollowerWithMembership[];
}>();

const emit = defineEmits(['close', 'member-update']);
const client = useSupabaseClient<Database>();

async function toggleMembership(follower: FollowerWithMembership) {
  if (!props.list) return;

  if (follower.isMemberList) {
    const { error } = await client.from('user_list_members')
      .delete()
      .match({ list_id: props.list.id, member_id: follower.id });
    
    if (error) {
      toast.error("Erro ao remover membro.");
    } else {
      emit('member-update', { followerId: follower.id, isMember: false });
    }
  } else {
    const { error } = await client.from('user_list_members')
      .insert({ list_id: props.list.id, member_id: follower.id });
    
    if (error) {
      toast.error("Erro ao adicionar membro.");
    } else {
      emit('member-update', { followerId: follower.id, isMember: true });
    }
  }
}
</script>

<template>
  <Modal :is-open="isOpen" :title="`Gerenciar Membros: ${list?.name}`" @close="emit('close')">
    <div class="modal-body" v-if="list">
      <div v-if="followers.length > 0" class="followers-list">
        <div v-for="follower in followers" :key="follower.id" class="follower-item">
          <div class="user-info">
            <img v-if="follower.avatar_url" :src="follower.avatar_url" class="avatar" />
            <div v-else class="avatar-fallback">{{ follower.username.charAt(0) }}</div>
            <span>{{ follower.username }}</span>
          </div>
          <button @click="toggleMembership(follower)" :class="follower.isMemberList ? 'secondary' : 'primary'">
            {{ follower.isMemberList ? 'Remover' : 'Adicionar' }}
          </button>
        </div>
      </div>
      <EmptyState v-else
        icon="lucide:users"
        title="Nenhum seguidor"
        message="Você precisa ter seguidores para adicioná-los a uma lista."
      />
    </div>
  </Modal>
</template>

<style scoped>
.followers-list {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.follower-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.avatar, .avatar-fallback {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: hsl(var(--gold));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
}
</style>