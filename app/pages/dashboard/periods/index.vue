<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { PeriodWithVisibility } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();
const router = useRouter();

const loading = ref(true);
const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const periods = ref<PeriodWithVisibility[]>([]);
const editingPeriod = ref<PeriodWithVisibility | null>(null);
const periodToDelete = ref<PeriodWithVisibility | null>(null);

const filters = ref({
  search: '',
  category: 'all',
  sort: 'newest' as 'newest' | 'oldest'
});

const periodCategories = [
  { label: 'Educação', value: 'education', icon: 'lucide:graduation-cap' },
  { label: 'Carreira', value: 'work', icon: 'lucide:briefcase' },
  { label: 'Relacionamento', value: 'relationship', icon: 'lucide:heart' },
  { label: 'Residência', value: 'residence', icon: 'lucide:home' },
  { label: 'Viagem', value: 'travel', icon: 'lucide:plane' },
  { label: 'Projeto', value: 'project', icon: 'lucide:code' },
  { label: 'Outro', value: 'other', icon: 'lucide:calendar' },
];

async function fetchPeriods() {
  if (!user.value) return;
  const { data, error } = await client
    .from('periods')
    .select('*, period_list_visibility(*)')
    .eq('user_id', user.value.sub);
  
  if (error) {
    toast.error('Erro ao carregar os períodos.');
  } else {
    periods.value = data;
  }
  loading.value = false;
}

const filteredPeriods = computed(() => {
  let result = [...periods.value];

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.description?.toLowerCase().includes(search) ||
      p.location?.toLowerCase().includes(search)
    );
  }

  if (filters.value.category !== 'all') {
    result = result.filter(p => p.type === filters.value.category);
  }

  result.sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    
    return filters.value.sort === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return result;
});

function editPeriod(period: PeriodWithVisibility) {
  editingPeriod.value = period;
  isModalOpen.value = true;
}

function promptDeletePeriod(period: PeriodWithVisibility) {
  periodToDelete.value = period;
  isConfirmModalOpen.value = true;
}

async function deletePeriod(period: PeriodWithVisibility) {
  if (!periodToDelete.value) return;
  const { error } = await client.from('periods').delete().eq('id', periodToDelete.value.id);
  
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Período excluído com sucesso.');
    fetchPeriods();
  }
  closeConfirmModal();
}

function navigateToPeriod(id: string) {
  router.push(`/dashboard/periods/${id}`);
}

function closeModal() {
  isModalOpen.value = false;
  editingPeriod.value = null;
}

function closeConfirmModal() {
  isConfirmModalOpen.value = false;
  periodToDelete.value = null;
}

function handleSuccess() {
  fetchPeriods();
}

onMounted(fetchPeriods);
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Períodos de Vida</h1>
      <p>Organize sua história em capítulos significativos.</p>
    </div>
    <button @click="isModalOpen = true" class="btn primary">
      <Icon name="lucide:plus" />
      Novo Período
    </button>
  </div>

    <ListFilters
      type="periods"
      placeholder="Buscar períodos..."
      :categories="periodCategories"
      v-model="filters"
    />

  <div v-if="loading" class="loading-state"><Icon name="lucide:loader-circle" class="spinner"/> Carregando...</div>
  <div v-else-if="filteredPeriods.length > 0" class="periods-grid">
    <div
      v-for="period in filteredPeriods"
      :key="period.id"
      @click="navigateToPeriod(period.id)"
      class="period-link"
    >
      <PeriodCard
        :period="period"
        :is-owner="true"
        @edit="editPeriod(period)"
        @delete="promptDeletePeriod(period)"
      />
    </div>
  </div>
  <EmptyState v-else-if="periods.length > 0"
    icon="lucide:search-x"
    title="Nenhum período encontrado"
    message="Tente ajustar sua busca ou filtros para encontrar o que procura."
  >
    <button @click="filters = { search: '', category: 'all', sort: 'newest' }" class="btn secondary">
      Limpar Filtros
    </button>
  </EmptyState>
  <EmptyState v-else
    icon="lucide:calendar"
    title="Nenhum período cadastrado"
    message="Comece organizando sua vida em capítulos significativos."
  >
    <button @click="isModalOpen = true" class="btn primary">
      <Icon name="lucide:plus" />
      Criar Primeiro Período
    </button>
  </EmptyState>

  <Modal
    :is-open="isModalOpen"
    :is-top-modal="true"
    :title="editingPeriod ? 'Editar Período' : 'Criar Novo Período'"
    @close="closeModal"
  >
    <PeriodForm :initial-data="editingPeriod" @close="closeModal" @success="handleSuccess" />
  </Modal>

  <ConfirmModal
    :is-open="isConfirmModalOpen"
    title="Confirmar exclusão"
    message="Tem certeza que deseja excluir este período? Esta ação não pode ser desfeita."
    @cancel="closeConfirmModal"
    @confirm="deletePeriod"
  />
</template>

<style scoped>
.periods-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
}
.period-link {
  display: contents;
  cursor: pointer;
}

@media (min-width: 768px) {
  .periods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .periods-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

</style>
