<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Memory, MemoryWithAuthor, CommentWithProfile, SelectedMemory } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(true);
const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const memories = ref<MemoryWithAuthor[]>([]);
const editingMemory = ref<Memory | null>(null);
const memoryToDelete = ref<Memory | null>(null);

const isDetailModalOpen = ref(false);
const selectedMemoryIndex = ref(-1);
const selectedMemoryData = ref<SelectedMemory>({ memory: null, likes: [], comments: [] });

async function fetchMemories() {
  if (!user.value) return;

  const { data, error } = await client
    .from('memories')
    .select('*, profiles(*)')
    .eq('user_id', user.value.sub)
    .order('date', { ascending: false });
  
  if (error) {
    toast.error('Erro ao carregar as memórias.');
  } else {
    memories.value = data;
  }
  loading.value = false;
}

function editMemory(memory: Memory) {
  editingMemory.value = memory;
  isModalOpen.value = true;
}

function promptDeletePeriod(memory: Memory) {
  memoryToDelete.value = memory;
  isConfirmModalOpen.value = true;
}

async function deleteMemory(memory: Memory) {
  if (!memoryToDelete.value) return;
  const { error } = await client.from('memories').delete().eq('id', memoryToDelete.value.id);
  
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Memória excluída com sucesso.');
    fetchMemories();
  }
  closeConfirmModal();
}

async function handlePostComment(content: string) {
  if (!user.value || !selectedMemory.value) return;

  const { data: newComment, error } = await client
    .from('comments')
    .insert({
      user_id: user.value.id,
      memory_id: selectedMemory.value.id,
      content: content.trim(),
    })
    .select('*, profiles(*)')
    .single();
  
  if (error) {
    toast.error('Erro ao postar o comentário: ' + error.message);
  } else if (newComment) {
    selectedMemoryData.value.comments.push(newComment as CommentWithProfile);
    toast.success('Comentário adicionado!');
  }
}

async function handleLikeToggle() {
  if (!user.value || !selectedMemory.value) return;

  const memoryId = selectedMemory.value.id;
  const userId = user.value.sub;
  const currentLikes = selectedMemoryData.value.likes;

  const existingLike = currentLikes.find(like => like.user_id === userId);

  if (existingLike) {
    selectedMemoryData.value.likes = currentLikes.filter(like => like.user_id !== userId);

    const { error } = await client
      .from('likes')
      .delete()
      .match({ user_id: userId, memory_id: memoryId });

    if (error) {
      selectedMemoryData.value.likes = currentLikes;
      toast.error('Erro ao remover o like.');
    }
  } else {
    const optimisticLike = {
      user_id: userId,
      memory_id: memoryId,
      created_at: new Date().toISOString()
    };
    selectedMemoryData.value.likes.push(optimisticLike);

    const { error } = await client
      .from('likes')
      .insert({ user_id: userId, memory_id: memoryId });

    if (error) {
      selectedMemoryData.value.likes = currentLikes;
      toast.error('Erro ao adicionar o like: ' + error.message);
    }
  }
}

function closeModal() {
  isModalOpen.value = false;
  editingMemory.value = null;
}

function closeConfirmModal() {
  isConfirmModalOpen.value = false;
  memoryToDelete.value = null;
}

function handleSuccess() {
  fetchMemories();
}

const selectedMemory = computed(() => {
  return selectedMemoryIndex.value > -1 ? memories.value[selectedMemoryIndex.value] : null;
});

async function openMemoryDetail(index: number) {
  const memory = memories.value[index];
  if (!memory) return;

  selectedMemoryIndex.value = index;
  isDetailModalOpen.value = true;
  
  const { data: likes } = await client.from('likes').select('*').eq('memory_id', memory.id);
  const { data: comments } = await client.from('comments').select('*, profiles(*)').eq('memory_id', memory.id);
  
  selectedMemoryData.value = {
    memory: memory,
    likes: likes || [],
    comments: comments || [],
  };
}

function handleNavigate(direction: 'prev' | 'next') {
  const newIndex = direction === 'prev' ? selectedMemoryIndex.value - 1 : selectedMemoryIndex.value + 1;
  if (newIndex >= 0 && newIndex < memories.value.length) {
    openMemoryDetail(newIndex);
  }
}

onMounted(fetchMemories);
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Memórias</h1>
        <p>Preserve momentos especiais da sua jornada.</p>
      </div>
      <button @click="isModalOpen = true" class="btn primary">
        <Icon name="lucide:plus" />
        Nova Memória
      </button>
    </div>

    <div v-if="loading" class="loading-state"><Icon name="lucide:loader-circle" class="spinner"/> Carregando...</div>
    <div v-else-if="memories.length > 0" class="memories-grid">
      <div v-for="(memory, index) in memories" :key="memory.id" @click="openMemoryDetail(index)" class="card-wrapper">
        <MemoryCard
          :memory="memory"
          :is-owner="true"
          @edit="editMemory(memory)"
          @delete="promptDeletePeriod(memory)"
        />
      </div>
    </div>
    <EmptyState v-else
      icon="lucide:image"
      title="Nenhuma memória cadastrada"
      message="Comece a preservar os momentos especiais da sua vida."
    >
      <button @click="isModalOpen = true" class="btn primary">
        <Icon name="lucide:plus" />
        Criar Primeira Memória
      </button>
    </EmptyState>

    <MemoryDetailModal
      :is-open="isDetailModalOpen"
      :memory="selectedMemoryData.memory"
      :likes="selectedMemoryData.likes"
      :comments="selectedMemoryData.comments"
      @close="isDetailModalOpen = false"
      @navigate="handleNavigate"
      @comment="handlePostComment"
      @like="handleLikeToggle"
    />

    <Modal
      :is-open="isModalOpen"
      :title="editingMemory ? 'Editar Memória' : 'Criar Nova Memória'"
      @close="closeModal"
    >
      <MemoryForm :initial-data="editingMemory" @close="closeModal" @success="handleSuccess" />
    </Modal>

    <ConfirmModal
      :is-open="isConfirmModalOpen"
      title="Confirmar exclusão"
      message="Tem certeza que deseja excluir esta memória? Esta ação não pode ser desfeita."
      @cancel="closeConfirmModal"
      @confirm="deleteMemory"
    />
  </div>
</template>

<style scoped>
.memories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.loading-state {
  text-align: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
}
.card-wrapper { cursor: pointer; }

@media (min-width: 768px) {
  .memories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .memories-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>