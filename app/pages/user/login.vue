<template>
  <AuthCard msg="Acesse sua conta para continuar sua jornada.">
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" placeholder="seu@email.com" required />
      </div>
      <div class="form-group">
        <label for="password">Senha</label>
        <input type="password" id="password" v-model="password" placeholder="••••••••" required />
      </div>
      <button type="submit" class="btn primary" :disabled="loading">
        <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
    <div class="switch-page">
      <p><NuxtLink to="/user/password-reset">Esqueceu sua senha?</NuxtLink></p>
      <p><NuxtLink to="/user/register">Não tem uma conta? Cadastre-se</NuxtLink></p>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';

const client = useSupabaseClient();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Login realizado com sucesso!');
    router.push('/dashboard');
  }
  loading.value = false;
};
</script>
