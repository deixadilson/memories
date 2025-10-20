<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Memory } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const isModalOpen = ref(false);
const loading = ref(true);
const memories = ref<Memory[]>([]);

async function fetchMemories() {
  if (!user.value) return;
  const { data, error } = await client
    .from('memories')
    .select('*')
    .eq('user_id', user.value.sub)
    .order('date', { ascending: false });
  
  if (error) {
    toast.error('Erro ao carregar as memórias.');
  } else {
    memories.value = data;
  }
  loading.value = false;
}

async function deleteMemory(memoryId: string) {
  if (confirm('Tem certeza que deseja excluir esta memória?')) {
    const { error } = await client.from('memories').delete().eq('id', memoryId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Memória excluída com sucesso.');
      fetchMemories();
    }
  }
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
      <MemoryCard
        v-for="memory in memories"
        :key="memory.id"
        :memory="memory"
        :is-owner="true"
        @delete="deleteMemory(memory.id)"
      />
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
      title="Criar Nova Memória"
      @close="isModalOpen = false"
    >
      <MemoryForm @close="isModalOpen = false" @success="handleSuccess" />
    </Modal>
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