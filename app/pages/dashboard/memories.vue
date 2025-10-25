<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Memory, MemoryWithAuthor } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const { open: openMemoryModal } = useMemoryModal();

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(true);
const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const memories = ref<MemoryWithAuthor[]>([]);
const editingMemory = ref<Memory | null>(null);
const memoryToDelete = ref<Memory | null>(null);

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

function promptDeleteMemory(memory: Memory) {
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
      <div v-for="(memory, index) in memories" :key="memory.id" @click="openMemoryModal(memories, index)" class="card-wrapper">
        <MemoryCard
          :memory="memory"
          :is-owner="true"
          @edit="editMemory(memory)"
          @delete="promptDeleteMemory(memory)"
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