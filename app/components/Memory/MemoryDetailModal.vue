<script setup lang="ts">
import type { MemoryWithAuthor, CommentWithProfile  } from '~/types/app';

const props = defineProps<{
  memory: MemoryWithAuthor | null;
  comments: CommentWithProfile[];
  isOpen: boolean;
  likes: any[];
  liking: boolean;
  navigationDirection: 'navigate-next' | 'navigate-prev';
}>();

const emit = defineEmits(['close', 'navigate', 'like', 'comment']);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen && memory" class="modal-overlay" @click.self="emit('close')">
        <div class="transition-wrapper">
          <Transition :name="navigationDirection" mode="out-in">
            <MemoryDetailView
              :memory="memory"
              :likes="likes"
              :comments="comments"
              :liking="liking"
              @like="emit('like')"
              @comment="emit('comment')"
              @navigate="emit('navigate', $event)"
            />
          </Transition>
          <button @click="emit('close')" class="close-btn"><Icon name="lucide:x" /></button>
        </div>
        <button @click="emit('navigate', 'prev')" class="nav-btn prev desktop-only"><Icon name="lucide:chevron-left" /></button>
        <button @click="emit('navigate', 'next')" class="nav-btn next desktop-only"><Icon name="lucide:chevron-right" /></button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active .modal-content,
.fade-leave-active .modal-content {
  transition: transform .3s ease;
}
.fade-enter-from .modal-content,
.fade-leave-to .modal-content {
  transform: scale(.95);
}
.transition-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 80vh;
  overflow: hidden;
}
.navigate-next-enter-active,
.navigate-next-leave-active,
.navigate-prev-enter-active,
.navigate-prev-leave-active {
  transition: transform .3s ease-out;
  position: absolute;
  top: 0;
  left: 0;
}
.navigate-next-enter-from {
  transform: translateX(100%);
}
.navigate-next-leave-to {
  transform: translateX(-100%);
}

.navigate-prev-enter-from {
  transform: translateX(-100%);
}
.navigate-prev-leave-to {
  transform: translateX(100%);
}
.memory-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  width: 100%;
  height: 100%;
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
.close-btn {
  position: absolute;
  top: 0; right: 0;
  opacity: .7;
  z-index: 1001;
}
.close-btn:hover {
  opacity: 1;
}
.nav-btn {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  padding: 1rem;
  border-radius: 50%;
  background-color: hsl(var(--background) / .9);
  cursor: pointer;
  z-index: 1000;
  box-shadow:  10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);
  transition: background-color 0.2s ease;
}
.nav-btn:hover {
  color: hsl(var(--accent-foreground));
  background-color: hsl(var(--background));
}
.nav-btn .iconify, .close-btn .iconify {
  width: 1rem; height: 1rem;
}
.nav-btn.prev {
  top: 50%;
  left: 1.5rem;
  transform: translateY(-50%);
}
.nav-btn.next {
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
}
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-next-enter-from {
  transform: translateX(100%);
}
.slide-next-leave-to {
  transform: translateX(-100%);
}
.slide-prev-enter-from {
  transform: translateX(-100%);
}
.slide-prev-leave-to {
  transform: translateX(100%);
}

@media (min-width: 901px) {
  .carousel-nav {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }
  .desktop-only {
    display: flex;
  }
}

@media (max-width: 900px) {
  .modal-overlay {
    overflow-y: auto;
    align-items: flex-start;
    padding: 2rem 0;
  }
  .transition-wrapper {
    width: 90%;
    height: auto;
    max-height: none;
    margin: 0 auto;
    overflow: visible;
  }
  .memory-content {
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: none;
    width: 90%;
    margin: 0 auto;
    border-radius: var(--radius);
  }
  .nav-btn {
    position: fixed;
    bottom: 1.5rem;
    top: auto;
    transform: none;
    opacity: .5;
  }
  .nav-btn.prev {
    left: 1rem;
  }
  .nav-btn.next {
    right: 1rem;
  }
  .close-btn {
    position: fixed;
    background-color: hsl(var(--background) / .5);
    top: 1rem;
    right: 1rem;
    z-index: 1001;
  }
  .desktop-only {
    display: none;
  }
}
</style>
