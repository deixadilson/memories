<script setup lang="ts">
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient();
const router = useRouter();

const loading = ref(false);
const newPassword = ref('');
const confirmNewPassword = ref('');

async function handleChangePassword() {
  if (newPassword.value !== confirmNewPassword.value) {
    toast.error('As novas senhas não coincidem.');
    return;
  }
  if (newPassword.value.length < 8) {
    toast.error('A nova senha deve ter no mínimo 8 caracteres.');
    return;
  }

  loading.value = true;
  
  const { error } = await client.auth.updateUser({
    password: newPassword.value,
  });

  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Senha alterada com sucesso!');
    newPassword.value = '';
    confirmNewPassword.value = '';
  }
  loading.value = false;
}
</script>

<template>
  <div class="container">
    <div class="password-card">
      <div class="card-header">
        <h3>Alterar Senha</h3>
        <p>Para sua segurança, escolha uma senha forte.</p>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="new-password">Nova Senha</label>
            <input id="new-password" v-model="newPassword" type="password" placeholder="••••••••" required />
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirmar Nova Senha</label>
            <input id="confirm-password" v-model="confirmNewPassword" type="password" placeholder="••••••••" required />
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit" :disabled="loading">
              <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
              {{ loading ? 'Salvando...' : 'Salvar Nova Senha' }}
            </button>
            <NuxtLink to="/dashboard" class="btn secondary">Cancelar</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 42rem;
  margin-right: auto;
  margin-left: auto;
  padding: 2rem;
}
.password-card {
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
.card-header h3 {
  font-size: 1.5rem;
  line-height: 1;
  letter-spacing: -.025em;
  font-weight: 600;
}
.card-header p {
  font-size: .875rem;
}
.card-body {
  padding: 1.5rem; 
  padding-top: 0;
}
label {
  font-weight: 500;
  font-size: .875rem;
  line-height: 1;
}
input {
  display: flex;
  width: 100%;
  font-size: .875rem;
  line-height: 1.25rem;
  margin-top: .5rem;
  padding: .5rem .75rem;
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  background-color: hsl(var(--background));
  height: 2.5rem;
}
.form-group:not(:first-child) {
  margin-top: 1.5rem;
}
.form-actions {
  display: flex;
  gap: .75rem;
  margin-top: 1.5rem;
}
</style>
