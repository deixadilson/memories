<script setup lang="ts">
import type { UserWithStatus } from '~/types/app';
defineProps<{ users: UserWithStatus[] }>();
</script>

<template>
  <div class="tab-content">
    <div v-if="users.length > 0" class="user-list">
      <UserListItem v-for="user in users" :key="user.id" :user="user" :status="user.status"/>
    </div>
    <EmptyState v-else icon="lucide:users" title="Nenhum seguidor" message="Quando alguém te seguir, aparecerá aqui."/>
  </div>
</template>
