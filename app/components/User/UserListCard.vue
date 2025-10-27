<script setup lang="ts">
import type { UserList } from '~/types/app';

defineProps<{ list: UserList }>();
const emit = defineEmits(['edit', 'delete', 'manage']);
</script>

<template>
  <div class="list-card">
    <div class="card-content">
      <div class="title-group">
        <h3><Icon name="lucide:list" /> {{ list.name }}</h3>
        <p class="description">{{ list.description }}</p>
      </div>
      <div class="actions">
        <button @click.stop="emit('edit')" class="action-btn" title="Editar">
          <Icon name="lucide:pencil" />
        </button>
        <button @click.stop="emit('delete')" class="action-btn destructive" title="Excluir">
          <Icon name="lucide:trash-2" />
        </button>
      </div>
    </div>
    <div class="card-footer">
      <button @click="emit('manage')" class="btn secondary">
        Gerenciar Membros
      </button>
    </div>
  </div>
</template>

<style scoped>
.list-card {
  padding: 1.5rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);
}
.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
h3 {
  display: flex; align-items: center; gap: .5rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
}
p {
  font-size: .875rem;
  line-height: 1.25rem;
  margin-top: .25rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  padding: 0.25rem;
  width: 2.5rem; height: 2.5rem;
}
.action-btn.destructive {
  color: hsl(var(--destructive));
}
.action-btn:hover {
  background-color: hsl(var(--accent));
}
.description {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}
.card-footer .btn {
  width: 100%;
}
</style>
