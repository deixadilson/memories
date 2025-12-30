<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { MemoryComplete } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const { open: openMemoryModal } = useMemoryModal();

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(true);
const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const isTagModalOpen = ref(false);
const isMidiaModalOpen = ref(false);
const memories = ref<MemoryComplete[]>([]);
const editingMemory = ref<MemoryComplete | null>(null);
const memoryToDelete = ref<MemoryComplete | null>(null);

const filters = ref({
  search: '',
  category: 'all',
  sort: 'newest' as 'newest' | 'oldest'
});

const memoryCategories = [
  { label: 'Viagem', value: 'travel', icon: 'lucide:plane' },
  { label: 'Educação', value: 'education', icon: 'lucide:graduation-cap' },
  { label: 'Família', value: 'family', icon: 'lucide:users' },
  { label: 'Carreira', value: 'work', icon: 'lucide:briefcase' },
  { label: 'Pessoal', value: 'personal', icon: 'lucide:user' },
  { label: 'Conquista', value: 'milestone', icon: 'lucide:award' },
  { label: 'Outro', value: 'other', icon: 'lucide:shapes' },
];

async function fetchMemories() {
  if (!user.value) return;

  const { data, error } = await client
    .from('memories')
    .select('*, profiles(*), memory_list_visibility(*)')
    .eq('user_id', user.value.sub);
  
  if (error) {
    toast.error('Erro ao carregar as memórias.');
  } else {
    memories.value = data;
  }
  loading.value = false;
}

const filteredMemories = computed(() => {
  let result = [...memories.value];

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(m => 
      m.title.toLowerCase().includes(search) || 
      m.description?.toLowerCase().includes(search) ||
      m.location?.toLowerCase().includes(search)
    );
  }

  if (filters.value.category !== 'all') {
    result = result.filter(m => m.category === filters.value.category);
  }

  result.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    return filters.value.sort === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return result;
});

function editMemory(memory: MemoryComplete) {
  editingMemory.value = memory;
  isModalOpen.value = true;
}

function promptDeleteMemory(memory: MemoryComplete) {
  memoryToDelete.value = memory;
  isConfirmModalOpen.value = true;
}

async function deleteMemory(memory: MemoryComplete) {
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

    <ListFilters
      type="memories"
      placeholder="Buscar memórias..."
      :categories="memoryCategories"
      v-model="filters"
    />

    <div v-if="loading" class="loading-state"><Icon name="lucide:loader-circle" class="spinner"/> Carregando...</div>
    <div v-else-if="filteredMemories.length > 0">
      <MasonryGrid :items="filteredMemories" v-slot="{ item, index }">
        <div @click="openMemoryModal(filteredMemories, index)" class="card-wrapper">
          <MemoryCard
            :memory="item"
            :is-owner="true"
            @edit="editMemory(item)"
            @delete="promptDeleteMemory(item)"
          />
        </div>
      </MasonryGrid>
    </div>
    <EmptyState v-else-if="memories.length > 0"
      icon="lucide:search-x"
      title="Nenhuma memória encontrada"
      message="Tente ajustar sua busca ou filtros para encontrar o que procura."
    >
      <button @click="filters = { search: '', category: 'all', sort: 'newest' }" class="btn secondary">
        Limpar Filtros
      </button>
    </EmptyState>
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
      :is-top-modal="!isTagModalOpen || !isMidiaModalOpen"
      @close="closeModal"
    >
      <MemoryForm
        :initial-data="editingMemory"
        @close="closeModal"
        @success="handleSuccess"
        v-model:isMediaModalOpen="isMidiaModalOpen"
        v-model:isTagModalOpen="isTagModalOpen"
      />
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
.card-wrapper {
  cursor: pointer;
}

</style>
