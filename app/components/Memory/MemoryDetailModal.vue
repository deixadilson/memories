<script setup lang="ts">
import { useGesture } from '@vueuse/gesture';
import type { MemoryWithAuthor, CommentWithProfile  } from '~/types/app';

const props = defineProps<{
  isOpen: boolean;
  liking: boolean;
  memory: MemoryWithAuthor | null;
  likes: any[];
  comments: CommentWithProfile[];
}>();

const emit = defineEmits(['close', 'navigate', 'like', 'comment']);
const user = useSupabaseUser();
const commentInput = ref<HTMLTextAreaElement | null>(null);
const newCommentContent = ref('');
const currentImageIndex = ref(0);
const imageElement = ref<HTMLElement | null>(null);
const detailsElement = ref<HTMLElement | null>(null);
const slideDirection = ref('slide-next');

const totalImages = computed(() => props.memory?.media_urls?.length || 0);
const currentImageUrl = computed(() => props.memory?.media_urls?.[currentImageIndex.value]);

const isTextOnly = computed(() => !props.memory?.media_urls || props.memory.media_urls.length === 0);
const isShortText = computed(() => (props.memory?.description?.length ?? 0) < 150);

const userHasLiked = computed(() => {
  if (!user.value || !props.likes) return false;
  return props.likes.some(like => like.user_id === user.value?.sub);
});

const formattedDate = computed(() => {
  if (!props.memory?.date) return 'Data não informada';
  const date = new Date(`${props.memory.date}T00:00:00`);

  switch (props.memory.date_precision) {
    case 'complete':
    case 'today':
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    case 'month_year':
      return date.toLocaleDateString('pt-BR', {
        month: 'long', year: 'numeric'
      });
    case 'year_only':
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric'
      });
    default:
      return props.memory.date;
  }
});

function nextImage() {
  if (currentImageIndex.value < totalImages.value - 1) {
    slideDirection.value = 'slide-next';
    currentImageIndex.value++;
  }
}
function prevImage() {
  if (currentImageIndex.value > 0) {
    slideDirection.value = 'slide-prev';
    currentImageIndex.value--;
  }
}

const imageDragHandler = ({ swipe: [swipeX] }: { swipe: [number, number] }) => {
  if (swipeX === -1) nextImage();
  if (swipeX === 1) prevImage();
};

const detailsDragHandler = ({ swipe: [swipeX] }: { swipe: [number, number] }) => {
  if (swipeX !== 0) {
    if (swipeX === -1) {
      if (totalImages.value > 1 && currentImageIndex.value < totalImages.value - 1) {
        nextImage();
      } else {
        emit('navigate', 'next');
      }
    } else if (swipeX === 1) {
      if (totalImages.value > 1 && currentImageIndex.value > 0) {
        prevImage();
      } else {
        emit('navigate', 'prev');
      }
    }
  }
};

watchEffect(() => {
  if (imageElement.value) {
    useGesture({ onDrag: imageDragHandler }, { domTarget: imageElement, eventOptions: { passive: true } });
  }
  if (detailsElement.value) {
    useGesture({ onDrag: detailsDragHandler }, { domTarget: detailsElement, eventOptions: { passive: true } });
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen && memory" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
          <div ref="imageElement" class="media-column">
            <template v-if="isTextOnly">
              <div class="text-media-container">
                <div class="meta">
                  <span v-if="memory.location"><Icon name="lucide:map-pin" /> {{ memory.location }}</span>
                  <span><Icon name="lucide:calendar" /> {{ formattedDate }}</span>
                </div>
                <p class="text-content" :class="{ 'is-short': isShortText }">{{ memory.description }}</p>
              </div>
            </template>
            <template v-else>
              <div class="image-slider-wrapper">
                <Transition :name="slideDirection">
                  <img
                    :key="currentImageIndex"
                    :src="currentImageUrl"
                    :alt="memory.title"
                    class="main-image"
                  />
                </Transition>
              </div>
              <div v-if="totalImages > 1" class="carousel-nav">
                <button @click.stop="prevImage" :disabled="currentImageIndex === 0" class="carousel-btn prev">
                  <Icon name="lucide:chevron-left" />
                </button>
                <button @click.stop="nextImage" :disabled="currentImageIndex === totalImages - 1" class="carousel-btn next">
                  <Icon name="lucide:chevron-right" />
                </button>
              </div>
              <div v-if="totalImages > 1" class="carousel-indicators">
                <button
                  v-for="(_, index) in memory.media_urls"
                  :key="index"
                  @click.stop="currentImageIndex = index"
                  class="indicator-dot"
                  :class="{ active: index === currentImageIndex }"
                ></button>
              </div>
            </template>
          </div>

          <div ref="detailsElement" class="details-column">
            <header>
              <h2>{{ memory.title }}</h2>
            </header>
            <div class="meta-and-desc" v-if="!isTextOnly">
              <div class="meta">
                <span><Icon name="lucide:calendar" /> {{ formattedDate }}</span>
                <span v-if="memory.location"><Icon name="lucide:map-pin" /> {{ memory.location }}</span>
              </div>
              <p class="description">{{ memory.description }}</p>
            </div>
            
            <div class="actions">
              <button @click="emit('like')" class="action-btn" :disabled="liking">
                <Icon v-if="liking" name="lucide:loader-circle" class="spinner" />
                <Icon v-else-if="userHasLiked" name="ic:favorite" class="like liked" />
                <Icon v-else name="ic:favorite-border" class="like" />
                <span>{{ likes.length }}</span>
              </button>
              <button @click="focusCommentInput" class="action-btn">
                <Icon name="lucide:message-circle" /> Comentar
              </button>
              <ShareDropdown :memory="memory" />
            </div>

            <div class="comments-section">
              <h4>Comentários ({{ comments.length }})</h4>
              <div class="comment-list">
                <p v-if="comments.length === 0">Nenhum comentário ainda.</p>
                <CommentItem
                  v-else
                  v-for="comment in comments"
                  :key="comment.id"
                  :comment="comment"
                />
              </div>
              <form @submit.prevent="submitComment">
                <textarea
                  ref="commentInput"
                  v-model="newCommentContent"
                  name="comment"
                  placeholder="Escreva um comentário..."
                  @keydown.enter.prevent="submitComment"
                >
                </textarea>
                <button type="submit"><Icon name="lucide:send" /></button>
              </form>
            </div>
          </div>
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
  transition: transform 0.3s ease;
}
.fade-enter-from .modal-content,
.fade-leave-to .modal-content {
  transform: scale(0.95);
}
.modal-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 80vh;
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
.media-column {
  background-color: #000;
  position: relative;
  overflow: hidden;
}
.details-column {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto;
}
.image-slider-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.carousel-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}
.carousel-btn {
  pointer-events: all;
  background-color: hsla(0, 0%, 100%, 0.1);
  border: 1px solid hsla(0, 0%, 100%, 0.2);
  border-radius: 50%;
  height: 2.5rem;
  padding: .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.carousel-btn:hover:not(:disabled) {
  background-color: hsla(0, 0%, 100%, 0.2);
}
.carousel-btn:disabled {
  opacity: 0;
  cursor: auto;
}
.carousel-btn .iconify {
  width: 1.5rem;
  height: 1.5rem;
}
.carousel-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}
.indicator-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: hsla(0, 0%, 100%, 0.4);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.indicator-dot.active {
  background-color: hsla(0, 0%, 100%, 0.9);
  transform: scale(1.1);
}
.text-media-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 2rem;
  background-color: hsl(var(--background));
  background-image: linear-gradient(to bottom right, hsl(var(--primary) / .3), hsl(var(--accent) / .3), hsl(var(--primary) / .5));
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.text-media-container .meta {
  position: absolute;
  top: 2rem; left: 2rem;
  align-items: flex-start;
  gap: .5rem;
  color: hsl(var(--foreground));
  font-weight: 500;
}
.text-content {
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.6;
}
.text-content.is-short {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.4;
}
.details-column header {
  margin-bottom: 1rem;
}
.details-column h2 {
  font-size: 1.5rem;
  font-weight: 700;
}
.meta-and-desc {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid hsl(var(--border));
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
.meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.description {
  line-height: 1.6;
  color: hsl(var(--foreground) / .9);
}
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid hsl(var(--border));
}
.action-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  height: 2.25rem;
  padding: 0 .75rem;
  border: none;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  background: none;
  font-weight: 500;
}
.action-btn:hover {
  color: hsl(var(--accent-foreground));
  background-color: hsl(var(--muted));
}
.like {
  width: 1.1rem;
  height: 1.1rem;
}
.liked {
  color: #ef4444;
}
.comments-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.comments-section h4 {
  font-weight: 600;
  margin-bottom: 1rem;
}
.comment-list {
  flex-grow: 1;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}
.comments-section form {
  position: relative;
  margin-top: 1rem;
}
.comments-section textarea {
  width: 100%;
  height: 48px;
  min-height: 48px;
  padding: .75rem 2.5rem .75rem 1rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--muted));
  resize: none;
}
.comments-section button[type="submit"] {
  position: absolute;
  right: .25rem; top: .25rem; bottom: .25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: hsl(var(--gold));
  color: hsl(var(--primary-foreground));
  cursor: pointer;
}
.comments-section button[type="submit"]:hover {
  background-color: hsl(var(--gold-light));
}
.comments-section span {
  width: 1rem; height: 1rem;
}
.close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  opacity: .7;
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
  .modal-content {
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: none;
    width: 90%;
    margin: 0 auto;
    border-radius: var(--radius);
  }
  .media-column {
    width: 100%;
    aspect-ratio: 4 / 3;
    max-height: 70vh;
    border-radius: var(--radius) var(--radius) 0 0;
  }
  .details-column {
    height: auto;
  }
  .actions {
    justify-content: space-evenly;
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
