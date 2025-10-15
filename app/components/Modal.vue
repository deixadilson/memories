<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits(['close']);
const modalContent = ref(null);

onClickOutside(modalContent, () => emit('close'));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay">
        <div class="modal-content" ref="modalContent">
          <header class="modal-header">
            <h2>{{ title }}</h2>
          </header>
          <slot />
          <button @click="$emit('close')" class="close-button">
            <Icon name="lucide:x" />
            <span class="sr-only">Close</span>
          </button>
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
  z-index: 70;
}
.modal-content {
  display: grid;
  gap: 1rem;
  position: fixed;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: hsl(var(--background));
  border-radius: var(--radius);
  z-index: 70;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);
  animation: slide-up .3s ease-out;
}
.modal-header {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.modal-header h2 {
  font-size: 1.125rem;
  line-height: 1;
  letter-spacing: -.025em;
  font-weight: 600;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.close-button {
  position: absolute;
  top: 1rem; right: 1rem;
  width: 1rem; height: 1rem;
  padding: 0;
  background-color: transparent;
  opacity: .7;
}
.close-button:hover {
  opacity: 1;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (min-width: 640px) {
  .modal-header {
    text-align: left;
  }
}
</style>
