<template>
  <AuthCard msg="Defina sua nova senha.">
    <form @submit.prevent="handleUpdatePassword">
      <div class="form-group">
        <label for="password">Nova Senha</label>
        <input type="password" id="password" v-model="password" placeholder="••••••••" required />
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirme a Nova Senha</label>
        <input type="password" id="confirm-password" v-model="confirmPassword" placeholder="••••••••" required />
      </div>
      <button type="submit" class="btn primary" :disabled="loading">
        {{ loading ? 'Atualizando...' : 'Atualizar Senha' }}
      </button>
    </form>
  </AuthCard>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';

const client = useSupabaseClient();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const handleUpdatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error('As senhas não coincidem.');
    return;
  }
  if (password.value.length < 8) {
    toast.error('A nova senha deve ter no mínimo 8 caracteres.');
    return;
  }
  loading.value = true;
  const { error } = await client.auth.updateUser({ password: password.value });

  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Sua senha foi atualizada com sucesso!');
    router.push('/user/login');
  }
  loading.value = false;
};
</script>
