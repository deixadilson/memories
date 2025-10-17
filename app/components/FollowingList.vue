<script setup lang="ts">
import type { Profile } from '~/types/app';
defineProps<{ users: Profile[] }>();
</script>

<template>
  <div class="tab-content">
    <div v-if="users.length > 0" class="user-list">
      <UserListItem v-for="user in users" :key="user.id" :user="user" status="following" />
    </div>
    <EmptyState v-else icon="lucide:user-plus" title="Você não segue ninguém" message="Comece a seguir pessoas para vê-las aqui." />
  </div>
</template>
