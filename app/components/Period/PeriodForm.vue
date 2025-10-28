<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { PeriodWithVisibility, PeriodInsert, PeriodFormData, UserList } from '~/types/app';

const props = defineProps<{ initialData?: PeriodWithVisibility | null }>();
const emit = defineEmits(['close', 'success']);

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const periodData = ref<PeriodFormData>({
  title: '',
  type: 'residence',
  start_date: '',
  end_date: '',
  location: '',
  description: '',
  visibility: 'public',
});

const userLists = ref<UserList[]>([]);
const selectedListIds = ref<string[]>([]);

const periodTypes = [
  { value: 'residence', label: 'Residência' },
  { value: 'work', label: 'Trabalho' },
  { value: 'education', label: 'Educação' },
  { value: 'relationship', label: 'Relacionamento' },
  { value: 'travel', label: 'Viagem' },
  { value: 'project', label: 'Projeto' },
  { value: 'other', label: 'Outro' },
];
const visibilityOptions = [
  { id: 'private', label: 'Privado', icon: 'lucide:lock' },
  { id: 'friends', label: 'Amigos', icon: 'lucide:users' },
  { id: 'lists', label: 'Listas Específicas', icon: 'lucide:list' },
  { id: 'public', label: 'Público', icon: 'lucide:globe' },
];

onMounted(async () => {
  if (!user.value) return;
  const { data } = await client.from('user_lists').select('*').eq('owner_id', user.value.sub);
  userLists.value = data || [];
});

watchEffect(() => {
  if (props.initialData) {
    periodData.value = {
      title: props.initialData.title,
      type: props.initialData.type,
      start_date: props.initialData.start_date,
      end_date: props.initialData.end_date || '',
      location: props.initialData.location || '',
      description: props.initialData.description || '',
      visibility: props.initialData.visibility,
    };
    selectedListIds.value = props.initialData.period_list_visibility?.map(item => item.list_id) || [];
  }
});

const isEditMode = computed(() => !!props.initialData);

async function handleSubmit() {
  if (!user.value) return;

  loading.value = true;
  const dataToSubmit: Omit<PeriodInsert, 'user_id'> = {
    ...periodData.value,
    end_date: periodData.value.end_date || null,
    updated_at: new Date().toISOString(),
  };

  try {
    if (isEditMode.value) {
      const periodId = props.initialData!.id;
      const { error: updateError } = await client
        .from('periods')
        .update(dataToSubmit)
        .eq('id', periodId);
      
      if (updateError) throw updateError;

      await client.from('period_list_visibility').delete().eq('period_id', periodId);

      if (periodData.value.visibility === 'lists' && selectedListIds.value.length > 0) {
        const listLinks = selectedListIds.value.map(listId => ({ period_id: periodId, list_id: listId }));
        const { error: listError } = await client
          .from('period_list_visibility')
          .insert(listLinks);
        
        if (listError) throw listError;
      }
      toast.success('Período atualizado com sucesso!');
  } else {
      const { data: newPeriod, error: insertError } = await client
        .from('periods')
        .insert({ ...dataToSubmit, user_id: user.value.sub })
        .select('id').single();
      
      if (insertError) throw insertError;

      if (newPeriod && periodData.value.visibility === 'lists' && selectedListIds.value.length > 0) {
        const listLinks = selectedListIds.value.map(listId => ({ period_id: newPeriod.id, list_id: listId }));

        const { error: listError } = await client
          .from('period_list_visibility')
          .insert(listLinks);
        
        if (listError) throw listError;
      }
      toast.success('Período criado com sucesso!');
    }
    emit('success');
    emit('close');
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="title">Título *</label>
      <input id="title" v-model="periodData.title" type="text" placeholder="Ex. Morei em Campinas" required/>
    </div>
    <div class="form-group">
      <label for="type">Tipo *</label>
      <select id="type" v-model="periodData.type" required>
        <option v-for="pType in periodTypes" :key="pType.value" :value="pType.value">{{ pType.label }}</option>
      </select>
    </div>
    <div class="grid">
      <div>
        <label for="start_date">Data Início *</label>
        <input id="start_date" v-model="periodData.start_date" type="date" required/>
      </div>
      <div>
        <label for="end_date">Data Fim</label>
        <input id="end_date" v-model="periodData.end_date" type="date"/>
      </div>
    </div>
      <div class="form-group">
        <label for="location">Localização</label>
        <input id="location" v-model="periodData.location" type="text" placeholder="Ex: São Paulo, Brasil"/>
      </div>
    <div class="form-group">
      <label for="description">Descrição</label>
      <textarea id="description" v-model="periodData.description" rows="3" placeholder="Descreva este período da sua vida..."></textarea>
    </div>
    <div class="form-group">
      <label>Visibilidade</label>
      <div class="radio-group">
        <label v-for="option in visibilityOptions" :key="option.id" class="radio-label">
          <input type="radio" :value="option.id" v-model="periodData.visibility" name="visibility"/>
          <span class="custom-radio"></span>
          <Icon :name="option.icon" class="icon"/>
          <span>{{ option.label }}</span>
        </label>
      </div>
    </div>
    <div v-if="periodData.visibility === 'lists'">
      <ListSelector :lists="userLists" v-model="selectedListIds" />
    </div>
    <button class="btn primary" type="submit" :disabled="loading">
      <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
      {{ loading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Período') }}
    </button>
  </form>
</template>

<style scoped>
label {
  font-size: .875rem;
  font-weight: 500;
}
.form-group:not(:first-child) {
  margin-top: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.radio-group {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-weight: normal;
  cursor: pointer;
  margin-bottom: 0;
}
.radio-label .icon {
  width: 1rem;
  height: 1rem;
}
.radio-label input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.custom-radio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid hsl(var(--input));
  border-radius: 50%;
  transition: all .2s ease;
}
.custom-radio::after {
  content: "";
  display: block;
  width: .75rem;
  height: .75rem;
  border-radius: 50%;
  background-color: hsl(var(--gold));
  transform: scale(0);
  transition: transform .2s ease;
}
.radio-label input:checked + .custom-radio {
  border-color: hsl(var(--gold));
}
.radio-label input:checked + .custom-radio::after {
  transform: scale(1);
}
button[type="submit"] {
  margin-top: 1rem;
  width: 100%;
}
</style>
