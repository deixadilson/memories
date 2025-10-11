<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(true);
const username = ref('');
const avatar_url = ref('');
const dob = ref('');
const biography = ref('');

onMounted(async () => {
  if (user.value) {
    const { data, error } = await client
      .from('profiles')
      .select('username, biography, avatar_url, date_of_birth')
      .eq('id', user.value.sub)
      .single();

    if (error) {
      toast.error('Erro ao carregar o perfil.');
    } else if (data) {
      username.value = data.username || '';
      dob.value = data.date_of_birth || '';
      biography.value = data.biography || '';
    }
  }
  loading.value = false;
});

const handleUpdateProfile = async () => {
  loading.value = true;
  if (user.value) {
    const { error } = await client
      .from('profiles')
      .update({
        username: username.value,
        date_of_birth: dob.value || null,
        biography: biography.value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.value.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Perfil atualizado com sucesso!');
    }
  }
  loading.value = false;
};
</script>

<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="card-header">
        <div class="header-wrapper">
          <div class="header-content">
            <div class="avatar-container">
              <span>
                <Icon name="lucide:user" class="avatar"/>
              </span>
            </div>
            <input type="file" name="avatar" accept="image/*" class="hidden" />
            <div>
              <h3>Meu Perfil</h3>
              <p>Gerencie suas informações pessoais</p>
            </div>
          </div>
          <button class="btn secondary">
            <Icon name="lucide:external-link" class="icon" />
            Ver Perfil Público
          </button>
        </div>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label for="username">Nome de usuário</label>
            <input id="username" v-model="username" type="text" />
          </div>
          <div class="form-group">
            <label for="dob">Data de Nascimento</label>
            <input id="dob" v-model="dob" type="date" />
            <p class="helper-text">Ao preencher, criaremos automaticamente um período "Vida" começando nesta data.</p>
          </div>
          <div class="form-group full-width">
            <label for="biography">Biografia</label>
            <textarea id="biography" v-model="biography" rows="4" placeholder="Conte um pouco sobre você..."></textarea>
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
            <button class="btn secondary" type="button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  width: 100%;
  max-width: 42rem;
  margin-right: auto;
  margin-left: auto;
  padding: 2rem;
}
.profile-card {
  color: hsl(var(--card-foreground));
  background-color: hsl(var(--card));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);
  border-radius: var(--radius);
}
.card-header {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}
.header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
}
.header-content {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.avatar-container {
  position: relative;
  cursor: pointer;
}
.avatar-container > span {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 4rem;
  height: 4rem;
  background-color: hsl(var(--muted));
  border-radius: 9999px;
  transition: opacity cubic-bezier(.4, 0, .2, 1) .15s;
}
.avatar {
  width: 2rem;
  height: 2rem;
}
.hidden {
  display: none;
}
h3 {
  font-size: 1.5rem;
  line-height: 1;
  letter-spacing: -.025em;
  font-weight: 600;
}
.card-header p {
  font-size: .875rem;
  line-height: 1.25rem;
  color: hsl(var(--muted-foreground));
}
.secondary {
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--input));
}
.secondary:hover {
  background-color: hsl(var(--muted));
}
.card-body {
  padding: 1.5rem; 
  padding-top: 0;
}
label {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1;
}
input, textarea {
  display: flex;
  width: 100%;
  font-size: .875rem;
  line-height: 1.25rem;
  margin-top: .5rem;
  padding: .5rem .75rem;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background-color: hsl(var(--background));
}
input {
  height: 2.5rem;
}
.form-group:not(:first-child) {
  margin-top: 1.5rem;
}
.helper-text {
  font-size: .875rem;
  line-height: 1.25rem;
  color: hsl(var(--muted-foreground));
  margin-top: .5rem;
}
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  padding-top: 1.5rem;
}
</style>
