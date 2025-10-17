<script setup lang="ts">
import type { UserWithStatus } from '~/types/app';

const props = defineProps<{ users: UserWithStatus[] }>();
const emit = defineEmits(['action']);

const searchQuery = ref('');

const filteredUsers = computed(() => {
  return (props.users).filter(p => p.username.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

function handleAction(userId: string, action: any) {
  emit('action', userId, action);
}
</script>

<template>
  <div class="tab-content">
    <div class="search-bar">
      <Icon name="lucide:search" class="search-icon" />
      <input v-model="searchQuery" type="text" placeholder="Pesquisar por nome de usuário..." />
    </div>
    <div class="user-list">
      <UserListItem
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        :status="user.status"
        @action="(action) => handleAction(user.id, action)"
      />
      <EmptyState v-if="filteredUsers.length === 0" icon="lucide:user-search" title="Nenhum usuário encontrado" message="Tente outros critérios de busca." />
    </div>
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
  left: 0.75rem;
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
  gap: 0.25rem;
}
</style>
