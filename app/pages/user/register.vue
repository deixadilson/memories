<script setup lang="ts">
import { toast } from 'vue-sonner';

const client = useSupabaseClient();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

watch(username, (newValue) => {
  let sanitized = newValue.toLowerCase();
  sanitized = sanitized.replace(/[^a-z0-9_.-]/g, '');
  if (sanitized !== newValue) username.value = sanitized;
});

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error('As senhas não coincidem.');
    return;
  }
  if (password.value.length < 8) {
    toast.error('A senha deve ter no mínimo 8 caracteres.');
    return;
  }
  if (!/^[a-z0-9_.-]{3,15}$/.test(username.value)) {
    toast.error('O nome de usuário é inválido.');
    return;
  }

  loading.value = true;
  const { error } = await client.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { username: username.value }
    }
  });

  if (error) {
    if (error.message.includes('profiles_username_key')) {
      toast.error('Este nome de usuário já está em uso. Por favor, escolha outro.');
    } else if (error.message.toLowerCase().includes('already registered')) {
      toast.error('Este e-mail já está cadastrado. Tente fazer login.');
    } else {
      toast.error('Ocorreu um erro no cadastro. Verifique os dados e tente novamente.');
      console.error('Supabase signup error:', error.message);
    }
  } else {
    toast.success('Registro realizado! Verifique seu e-mail para confirmar a conta.');
    router.push('/user/login');
  }
  loading.value = false;
};
</script>

<template>
  <AuthCard msg="Comece sua jornada e guarde suas memórias.">
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Nome de usuário</label>
        <input type="text" id="username" v-model="username" pattern="^[a-z0-9_.-]{3,15}$" placeholder="Seu nome de usuário" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" placeholder="seu@email.com" required />
      </div>
      <div class="form-group">
        <label for="password">Senha</label>
        <input type="password" id="password" v-model="password" placeholder="••••••••" required />
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirmar Senha</label>
        <input type="password" id="confirm-password" v-model="confirmPassword" placeholder="••••••••" required />
      </div>
      <button type="submit" class="btn primary" :disabled="loading">
        <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
        {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
      </button>
    </form>
    <div class="switch-page">
      <span>Já tem uma conta? </span>
      <NuxtLink to="/user/login">Faça login</NuxtLink>
    </div>
  </AuthCard>
</template>
