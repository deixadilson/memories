<script setup lang="ts">
import type { UserList } from '~/types/app';

const props = defineProps<{
  lists: UserList[];
  modelValue: string[];
}>();

const emit = defineEmits(['update:modelValue']);

const selectedLists = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div class="list-selector-container">
    <p v-if="lists.length === 0" class="empty-text">
      Você ainda não criou nenhuma lista.
    </p>
    <div v-else class="checkbox-group">
      <p>Selecione as listas</p>
      <label v-for="list in lists" :key="list.id" class="checkbox-label">
        <input type="checkbox" :value="list.id" v-model="selectedLists" />
        <span class="custom-checkbox"></span>
        <span>{{ list.name }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.list-selector-container {
  margin-top: .75rem;
}
.empty-text {
  font-size: .875rem;
  color: hsl(var(--muted-foreground));
  background-color: hsl(var(--muted) / .5);
  padding: 1rem;
  border-radius: var(--radius);
}
.empty-text a {
  font-weight: 500;
  text-decoration: underline;
  color: hsl(var(--foreground));
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
.checkbox-group p {
  font-size: .875rem;
  font-weight: 500;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
  cursor: pointer;
}
.checkbox-label input { display: none; }
.custom-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s ease;
}
.checkbox-label input:checked + .custom-checkbox {
  background-color: hsl(var(--gold));
  border-color: hsl(var(--gold));
}
.custom-checkbox::after {
  content: '✓';
  color: #fff;
  font-weight: 600;
  transform: scale(0);
  transition: transform 0.2s ease;
}
.checkbox-label input:checked + .custom-checkbox::after {
  transform: scale(1);
}
</style>
