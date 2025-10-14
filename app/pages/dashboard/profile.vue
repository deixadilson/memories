<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import imageCompression from 'browser-image-compression';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const firstLetter = computed(() => user.value?.user_metadata.username.charAt(0).toUpperCase() || '?');

const loading = ref(true);
const uploading = ref(false);
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
      avatar_url.value = data.avatar_url || '';
      dob.value = data.date_of_birth || '';
      biography.value = data.biography || '';
    }
  }
  loading.value = false;
});

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !user.value) return;

  uploading.value = true;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 64,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const fileExt = compressedFile.name.split('.').pop();
    const filePath = `${user.value.sub}.${fileExt}`;

    const { error: uploadError } = await client.storage
      .from('avatars')
      .upload(filePath, compressedFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = client.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newAvatarUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

    const { error: dbError } = await client
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.value.sub);

    if (dbError) throw dbError;

    avatar_url.value = newAvatarUrl;
    toast.success('Avatar atualizado com sucesso!');
  } catch (error: any) {
    toast.error(error.message || 'Falha ao atualizar o avatar.');
  } finally {
    uploading.value = false;
  }
};

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
      .eq('id', user.value.sub);

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
              <div>
                <img v-if="avatar_url" :src="avatar_url" alt="Avatar" class="avatar"/>
                <span v-else>{{ firstLetter }}</span>
                <div v-if="loading || uploading" class="upload-overlay">
                  <Icon name="lucide:loader-circle" class="spinner"/>
                </div>
              </div>
              <label for="avatar" title="Alterar Avatar">
                <Icon name="lucide:camera" class="icon"/>
              </label>
            </div>
            <input type="file" id="avatar" name="avatar" accept="image/jpeg, image/png, image/gif" class="hidden" @change="handleFileChange" :disabled="uploading"/>
            <div>
              <h3>Meu Perfil</h3>
              <p>Gerencie suas informações pessoais</p>
            </div>
          </div>
          <button class="btn secondary">
            <Icon name="lucide:external-link" class="icon"/>
            Ver Perfil Público
          </button>
        </div>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label for="username">Nome de usuário</label>
            <input id="username" v-model="username" type="text"/>
          </div>
          <div class="form-group">
            <label for="dob">Data de Nascimento</label>
            <input id="dob" v-model="dob" type="date"/>
            <p class="helper-text">Ao preencher, criaremos automaticamente um período "Vida" começando nesta data.</p>
          </div>
          <div class="form-group full-width">
            <label for="biography">Biografia</label>
            <textarea id="biography" v-model="biography" rows="4" placeholder="Conte um pouco sobre você..."></textarea>
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit" :disabled="loading">
              <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
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
.avatar-container > div {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 4rem;
  height: 4rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: hsl(var(--primary-foreground));
  background-color: hsl(var(--gold));
  border-radius: 9999px;
  overflow: hidden;
}
.upload-overlay {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: hsl(var(--silver-light));
  background-color: hsla(var(--background), 0.7);
}
.upload-overlay > .spinner {
  width: 2rem;
  height: 2rem;
}
.avatar {
  width: 4rem;
  height: 4rem;
}
.hidden {
  display: none;
}
.avatar-container > label {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: hsl(var(--background) / .6);
  opacity: 0;
  transition: opacity cubic-bezier(.4, 0, .2, 1) .15s;
}
.avatar-container > label > .icon {
  width: 2rem;
  height: 2rem;
  color: hsl(var(--foreground));
}
.avatar-container:hover > label {
  opacity: 1;
}
.spinner {
  animation: spin 1s linear infinite;
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
