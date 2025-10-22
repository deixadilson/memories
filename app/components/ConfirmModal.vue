<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits(['confirm', 'cancel']);

const modalContent = ref(null);
onClickOutside(modalContent, () => emit('cancel'));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay">
        <div class="modal-content" ref="modalContent">
          <h3 class="title">{{ title }}</h3>
          <p class="message">{{ message }}</p>
          <div class="actions">
            <button @click="emit('cancel')" class="btn secondary">Cancelar</button>
            <button @click="emit('confirm')" class="btn destructive">Excluir</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000c;
  z-index: 100;
}
.modal-content {
  width: 100%;
  max-width: 36rem;
  padding: 1.5rem;
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);
  animation: slide-up .3s ease-out;
}
.title {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.message {
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn {
  font-weight: 600;
}
.secondary {
  color: hsl(var(--foreground));
  background-color: transparent;
  border: 1px solid hsl(var(--border));
}
.destructive {
  color: hsl(var(--primary-foreground));
  background-color: hsl(var(--destructive));
}
.destructive:hover {
  background-color: hsl(var(--destructive) / .9);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
