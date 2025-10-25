<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';

const emit = defineEmits(['close', 'success']);
const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const personData = ref({
  full_name: '',
  email: '',
  relationship: '',
});

async function createPerson() {
  if (!user.value) return;

  loading.value = true;
  const { error: insertError } = await client.from('people').insert({
    creator_id: user.value.sub,
    full_name: personData.value.full_name,
    email: personData.value.email || null,
    relationship: personData.value.relationship || null,
  });

  if (insertError) {
    toast.error(insertError.message);
    loading.value = false;
    return;
  }

  if (personData.value.email) {
    const { error: invokeError } = await client.functions.invoke('invite-user', {
      body: {
        email: personData.value.email,
        inviterName: user.value.user_metadata.username,
      },
    });
    if (invokeError) {
      toast.warning(`Pessoa adicionada, mas falha ao enviar convite: ${invokeError.message}`);
    } else {
      toast.success('Pessoa adicionada e convite enviado!');
    }
  } else {
    toast.success('Pessoa adicionada com sucesso!');
  }

  emit('success');
  emit('close');
  loading.value = false;
}
</script>

<template>
  <form @submit.prevent="createPerson">
    <div class="form-group">
      <label for="name">Nome *</label>
      <input id="name" v-model="personData.full_name" type="text" placeholder="Ex: Maria Silva" required />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="personData.email" type="email" placeholder="maria@email.com" />
    </div>
    <div class="form-group">
      <label for="relationship">Relacionamento</label>
      <input id="relationship" v-model="personData.relationship" type="text" placeholder="Ex: Amiga da faculdade" />
    </div>
    <button class="btn primary" type="submit" :disabled="loading">
      <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
      {{ loading ? 'Adicionando...' : 'Adicionar Pessoa' }}
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
