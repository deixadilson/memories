<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';

type PeriodInsert = Database['public']['Tables']['periods']['Insert'];

const emit = defineEmits(['close', 'success']);
const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const periodData = ref({
  title: '',
  type: 'residence',
  start_date: '',
  end_date: '',
  location: '',
  description: '',
  visibility: 'public',
});

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

async function createPeriod() {
  if (!user.value) {
    toast.error('Você precisa estar logado.');
    return;
  }
  loading.value = true;
  const { error } = await client.from('periods').insert({
    ...periodData.value,
    user_id: user.value.sub,
    end_date: periodData.value.end_date || null,
  } as PeriodInsert);

  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Período criado com sucesso!');
    emit('success');
    emit('close');
  }
  loading.value = false;
}
</script>

<template>
  <form @submit.prevent="createPeriod">
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
    <button class="btn primary" type="submit" :disabled="loading">
      <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
      {{ loading ? 'Criando...' : 'Criar Período' }}
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
