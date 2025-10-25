<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';

const emit = defineEmits(['close', 'success']);
const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const listData = ref({ name: '', description: '' });

async function createList() {
  if (!user.value) return;

  loading.value = true;
  const { error } = await client.from('user_lists').insert({
    owner_id: user.value.sub,
    name: listData.value.name,
    description: listData.value.description || null,
  });
  
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Lista criada com sucesso!');
    emit('success');
    emit('close');
  }
  loading.value = false;
}
</script>

<template>
  <form @submit.prevent="createList">
    <div class="form-group">
      <label for="list-name">Nome da Lista *</label>
      <input id="list-name" v-model="listData.name" type="text" placeholder="Ex: Família, Trabalho" required />
    </div>
    <div class="form-group">
      <label for="list-desc">Descrição</label>
      <textarea id="list-desc" v-model="listData.description" rows="3" placeholder="Descreva esta lista..."></textarea>
    </div>
    <button class="btn primary" type="submit" :disabled="loading">
      <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
      {{ loading ? 'Criando...' : 'Criar Lista' }}
    </button>
  </form>
</template>

<style scoped>
.form-group:not(:first-child) {
  margin-top: 1rem;
}
button[type="submit"] {
  margin-top: 1rem;
  width: 100%;
}
</style>
