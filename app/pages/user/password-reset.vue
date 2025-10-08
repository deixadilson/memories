<template>
  <AuthCard msg="Recupere o acesso à sua conta.">
    <form @submit.prevent="handlePasswordReset">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" placeholder="seu@email.com" required />
      </div>
      <button type="submit" class="btn primary" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Enviar Link de Recuperação' }}
      </button>
    </form>
    <div class="switch-page">
      <NuxtLink to="/user/login">Voltar para o Login</NuxtLink>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const { $toast } = useNuxtApp();
const email = ref('');
const loading = ref(false);

const handlePasswordReset = async () => {
  loading.value = true;
  const { error } = await client.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/user/password-update`,
  });

  if (error) {
    $toast.error(error.message);
  } else {
    $toast.info('Um link para redefinição de senha foi enviado para o e-mail informado.');
  }
  loading.value = false;
};
</script>
