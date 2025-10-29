<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  existingMediaUrls: string[];
}>();

const emit = defineEmits(['close', 'save']);

const newFiles = ref<File[]>([]);
const currentUrls = ref<string[]>([]);
const urlsToRemove = ref<string[]>([]);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    newFiles.value = [];
    urlsToRemove.value = [];
    currentUrls.value = [...props.existingMediaUrls];
  }
});

function handleFileSelection(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newSelectedFiles = Array.from(target.files);
    newFiles.value.push(...newSelectedFiles );
  }
  target.value = '';
}

function removeNewFile(index: number) {
  newFiles.value.splice(index, 1);
}

function removeExistingUrl(url: string) {
  currentUrls.value = currentUrls.value.filter(u => u !== url);
  urlsToRemove.value.push(url);
}

function saveAndClose() {
  emit('save', {
    newFiles: newFiles.value,
    keptUrls: currentUrls.value,
    removedUrls: urlsToRemove.value,
  });
  emit('close');
}

function getPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}

const totalMediaCount = computed(() => {
  return currentUrls.value.length + newFiles.value.length;
});

const gridLayoutClass = computed(() => {
  const count = totalMediaCount.value;
  if (count === 1) return 'layout-single';
  if (count === 2) return 'layout-double';
  if (count === 3) return 'layout-triple';
  return 'layout-triple';
});
</script>

<template>
  <Modal :is-open="isOpen" :is-top-modal="true" title="Gerenciar Mídias" @close="saveAndClose">
    <div class="modal-body">
      <label for="media-input" class="file-input-label">
        <Icon name="lucide:upload" />
        <span>Selecionar Arquivos</span>
      </label>
      <input id="media-input" type="file" multiple accept="image/*" @change="handleFileSelection" class="hidden" />

      <div v-if="totalMediaCount > 0" class="previews-grid" :class="gridLayoutClass">

        <div v-for="url in currentUrls" :key="url" class="preview-item">
          <img 
            v-if="url.match(/\.(jpeg|jpg|gif|png|webp)$/i)"
            :src="url" 
            :alt="'Mídia existente'" 
            class="preview-media" 
          />
          <div v-else class="preview-media-fallback">
            <Icon name="lucide:video" />
          </div>
          <button @click="removeExistingUrl(url)" class="remove-btn" title="Remover">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div v-for="(file, index) in newFiles" :key="`${file.name}-${index}`" class="preview-item">
          <img 
            v-if="file.type.startsWith('image/')" 
            :src="getPreviewUrl(file)" 
            :alt="file.name" 
            class="preview-media" 
          />
          <div v-else class="preview-media-fallback">
            <Icon name="lucide:video" />
          </div>
          <button @click="removeNewFile(index)" class="remove-btn" title="Remover">
            <Icon name="lucide:x" />
          </button>
        </div>

      </div>

      <EmptyState v-else
        icon="lucide:image-plus"
        title="Nenhuma mídia selecionada"
        message="Clique no botão acima para adicionar imagens ou vídeos à sua memória."
      />

      <button @click="saveAndClose" class="btn primary">
        Concluir
      </button>
    </div>
  </Modal>
</template>

<style scoped>
.modal-body { display: flex; flex-direction: column; gap: 1.5rem; }
.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px dashed hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  cursor: pointer;
  margin-top: 0.5rem;
}
.file-input-label:hover {
  background-color: hsl(var(--muted));
}
.hidden { display: none; }
.previews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: .5rem;
  max-height: 50vh;
  overflow-y: auto;
  padding: 0.5rem;
}
.layout-single {
  grid-template-columns: 1fr;
}
.layout-double {
  grid-template-columns: repeat(2, 1fr);
}
.layout-triple {
  grid-template-columns: repeat(3, 1fr);
}
.preview-item {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background-color: hsl(var(--muted));
  border-radius: var(--radius);
}
.preview-media, .preview-media-fallback {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border-radius: var(--radius);
  object-fit: cover;
}
.preview-media-fallback {
  display: flex; align-items: center; justify-content: center;
  background-color: hsl(var(--muted));
}
.preview-media-fallback .iconify {
  width: 2rem; height: 2rem;
  color: hsl(var(--muted-foreground));
}
.remove-btn {
  position: absolute;
  top: -0.5rem; right: -0.5rem;
  width: 1.5rem; height: 1.5rem;
  display: flex; align-items: center; justify-content: center;
  padding: .25rem;
  background-color: hsl(var(--destructive));
  color: hsl(var(--primary-foreground));
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.btn { width: 100%; }
</style>
