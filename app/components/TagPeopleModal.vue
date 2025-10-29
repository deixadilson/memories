<script setup lang="ts">
import type { Profile, Person } from '~/types/app';

type TaggablePerson = {
  id: string;
  name: string;
  avatar_url?: string | null;
  type: 'user' | 'person';
};

const props = defineProps<{
  isOpen: boolean;
  following: Profile[];
  people: Person[];
  modelValue: string[];
}>();

const emit = defineEmits(['close', 'update:modelValue']);

const selectedPeopleIds = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const taggableList = computed<TaggablePerson[]>(() => {
  const persons: TaggablePerson[] = props.people.map(p => ({
    id: p.id,
    name: p.full_name,
    avatar_url: null,
    type: 'person',
  }));
  const users: TaggablePerson[] = props.following.map(u => ({
    id: u.id,
    name: u.username,
    avatar_url: u.avatar_url,
    type: 'user',
  }));
  return [...persons, ...users];
});

const searchQuery = ref('');
const filteredList = computed(() => {
  if (!searchQuery.value) return taggableList.value;
  return taggableList.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <Modal :is-open="isOpen" :is-top-modal="true" title="Marcar Pessoas" @close="emit('close')">
    <div class="modal-body">
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="Pesquisar por nome..." />
      </div>
      <div class="people-list">
        <label v-for="person in filteredList" :key="person.id" class="person-item">
          <input type="checkbox" :value="person.id" v-model="selectedPeopleIds" />
          <div class="avatar-container">
            <img v-if="person.avatar_url" :src="person.avatar_url" class="avatar" />
            <div v-else class="avatar-fallback">{{ person.name.charAt(0) }}</div>
          </div>
          <span>{{ person.name }}</span>
        </label>
      </div>
      <button @click="emit('close')" class="btn primary">Concluir</button>
    </div>
  </Modal>
</template>

<style scoped>
.search-bar { margin-bottom: 1rem; }
.people-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}
.person-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
}
.person-item:hover { background-color: hsl(var(--muted)); }
.person-item input { display: none; }
.person-item input:checked + .avatar-container {
  outline: 2px solid hsl(var(--gold));
}
.avatar-container {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: hsl(var(--beige-dark));
}
.avatar { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { font-weight: 600; color: hsl(var(--foreground)); }
.btn { width: 100%; }
</style>
