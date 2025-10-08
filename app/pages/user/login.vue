<script setup lang="ts">
import type { Database } from '~/types/supabase';

const email = ref('');
const password = ref('');
const client = useSupabaseClient<Database>();
const router = useRouter();
const { $toast } = useNuxtApp();

const handleLogin = async () => {
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    $toast.error(error.message);
  } else {
    $toast.success('Login realizado com sucesso!');
    router.push('/dashboard');
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card-header">
        <h1>Memórias</h1>
        <p>Acesse sua conta para continuar sua jornada.</p>
      </div>
      <div class="card-content">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit" class="btn primary">Entrar</button>
        </form>
        <div class="switch-page">
          <p><NuxtLink to="/user/password">Esqueceu sua senha?</NuxtLink></p>
          <p><NuxtLink to="/user/register">Não tem uma conta? Cadastre-se</NuxtLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: linear-gradient(to bottom right, hsl(36 44% 98%) , hsl(40 25% 92%) , hsl(350 30% 95%));
}
.auth-card {
  color: hsl(var(--card-foreground));
  width: 100%;
  max-width: 28rem;
  border-radius: var(--radius);
  background-color: hsl(var(--card));
  box-shadow: 0 1px 2px 0 var(--tw-shadow-color)
}
.card-header {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}
h1 {
  font-size: 1.875rem;
  line-height: 2.25rem;
  letter-spacing: -.025em;
  text-align: center;
  color: transparent;
  background-image: linear-gradient(to right, hsl(var(--gold)), hsl(var(--pink-light)));
  background-clip: text;
}
.auth-card p {
  font-size: .875rem;
  line-height: 1.25rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  margin-top: .25rem;
}
.card-content {
  padding: 1.5rem;
  padding-top: 0;
}
.form-group:not(:first-child) {
  margin-top: 1rem;
}
label {
  font-size: .875rem;
  line-height: 1;
  font-weight: 500;
}
input {
  display: flex;
  height: 2.5rem;
  width: 100%;
  padding: .5rem 0.75rem;
  margin-top: .5rem;
  border: 1px solid hsl(var(--input));
  background-color: hsl(var(--background));
  border-radius: calc(var(--radius) - 2px);
}
input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / .5);
}
button {
  width: 100%;
  margin-top: 1rem;
}
.switch-page {
  color: hsl(var(--muted-foreground));
  font-size: .875rem;
  line-height: 1.25rem;
  text-align: center;
  margin-top: 1rem;
}
.switch-page a:hover {
  color: hsl(var(--foreground));
}
</style>
