import { Toaster, toast } from 'vue-sonner';
import { defineNuxtPlugin } from '#app';
import { h } from 'vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NuxtSonner', {
    render: () => h(Toaster, {
      richColors: true,
      position: 'top-right',
    }),
  });

  return {
    provide: {
      toast,
    },
  };
});