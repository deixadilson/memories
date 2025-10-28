<script setup lang="ts">
import type { UserWithStatus } from '~/types/app';

const props = defineProps<{
  users: UserWithStatus[];
  actingUserId: string | null;
  emptyTitle: string;
  emptyMessage: string;
  emptyIcon: string;
}>();

const emit = defineEmits(['action']);

const searchQuery = ref('');

const filteredUsers = computed(() => {
  if (!searchQuery.value) return props.users;
  
  return props.users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <div class="list-container">
    <div class="search-bar">
      <Icon name="lucide:search" class="search-icon" />
      <input v-model="searchQuery" type="text" placeholder="Pesquisar por nome de usuário..." />
    </div>

    <div v-if="filteredUsers.length > 0" class="user-list">
      <UserListItem
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        :status="user.status"
        :acting-user-id="actingUserId"
        @action="(action) => emit('action', user.id, action)"
      />
    </div>
    
    <EmptyState
      v-else
      :icon="emptyIcon"
      :title="emptyTitle"
      :message="emptyMessage"
    />
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  max-width: 38rem;
  margin-bottom: 1.5rem;
}
.search-icon {
  position: absolute;
  top: 50%;
  left: .75rem;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
}
.search-bar input {
  width: 100%;
  padding-left: 2.5rem;
  height: 2.5rem;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: .25rem;
  padding: .25rem;
  background-color: hsl(var(--muted));
  border-radius: var(--radius);
}
</style>
