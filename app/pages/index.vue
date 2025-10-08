<template>
  <div class="main">
    <section class="hero">
      <div class="hero-background"><div></div></div>
      <div class="hero-content">
        <h1>Suas Memórias, <span>Sua História</span></h1>
        <p>Crie sua biografia digital conectando lugares, pessoas e momentos especiais. Registre sua história em uma linha do tempo única e compartilhável</p>
        <div class="hero-buttons">
          <NuxtLink to="/user/register" class="btn primary">Começar Minha História</NuxtLink>
          <a href="#timeline-example" class="btn secondary">Ver Exemplo</a>
        </div>
      </div>
      <div class="float dot-1"></div>
      <div class="float dot-2"></div>
      <div class="float dot-3"></div>
    </section>

    <section class="features">
      <div class="section-wrapper">
        <div class="section-header">
          <h2>Recursos <span>Poderosos</span></h2>
          <p>Ferramentas criadas para ajudar você a registrar, organizar e compartilhar sua história de vida.</p>
        </div>
        <div class="features-grid">
          <div class="card" v-for="(feature, index) in features" :key="feature.title" :style="`animation-delay: ${index * 0.1}s`">
            <div class="feature-wrapper">
              <div class="feature-icon">
                <Icon :name="feature.icon" class="icon" :style="`color: ${feature.color}`"/>
              </div>
              <h3>{{feature.title}}</h3>
              <p>{{feature.description}}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="timeline" id="timeline-example">
      <div class="section-wrapper">
        <div class="section-header">
          <h2>Sua Linha do <span>Tempo</span></h2>
          <p>Cada memória é um capítulo da sua história. Organize e reviva seus momentos mais preciosos.</p>
        </div>
        <div class="timeline-wrapper">
          <div class="line"></div>
          <div class="timeline-items">
            <div v-for="(memory, index) in mockMemories" :class="`item-row ${index % 2 === 0 ? 'left' : 'right'}`">
              <div class="memory-item">
                <MemoryCard :memory="memory"/>
              </div>
              <div class="timeline-dot"><div></div></div>
              <div class="empty-space"></div>
            </div>
          </div>
        </div>
        <div class="cta">
          <p>Pronto para começar sua própria linha do tempo?</p>
          <NuxtLink to="/user/register" class="btn primary">
            Criar Minha História
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const features = [
  {
    icon: 'lucide:clock',
    title: "Linha do Tempo",
    description: "Organize suas memórias cronologicamente e veja sua história se desenrolar",
    color: "#f0c442"
  },
  {
    icon: 'lucide:users',
    title: "Conecte Pessoas",
    description: "Relacione familiares, amigos e colegas às suas memórias especiais",
    color: "#edd4d8"
  },
  {
    icon: 'lucide:map',
    title: "Lugares Especiais",
    description: "Marque locais importantes e crie um mapa da sua jornada de vida",
    color: "#bac1c4"
  },
  {
    icon: 'lucide:camera',
    title: "Fotos & Vídeos",
    description: "Adicione mídias para dar vida às suas memórias mais preciosas",
    color: "#f0c442"
  },
  {
    icon: 'lucide:presentation',
    title: "Modo Apresentação",
    description: "Transforme suas memórias em uma apresentação envolvente",
    color: "#edd4d8"
  },
  {
    icon: 'lucide:share-2',
    title: "Compartilhamento",
    description: "Compartilhe sua história com família e amigos de forma segura",
    color: "#bac1c4"
  }
];

const mockMemories = [
  {
    id: "mock-1",
    title: "Formatura em Engenharia",
    date: "Dezembro 2020",
    location: "São Paulo, SP",
    people: ["Família", "Amigos da faculdade"],
    category: "milestone",
    description: "Um dos dias mais importantes da minha vida. Depois de 5 anos de dedicação, finalmente conquisto meu diploma de Engenharia. A cerimônia foi emocionante e cercada de pessoas queridas.",
    image: "/placeholder.svg"
  },
  {
    id: "mock-2",
    title: "Primeiro Emprego",
    date: "Janeiro 2021",
    location: "São Paulo, SP",
    people: ["Colegas de trabalho"],
    category: "work",
    description: "Início da minha carreira profissional em uma startup de tecnologia. Nervosismo, expectativas e muita vontade de aprender. Foi o começo de uma jornada incrível.",
  },
  {
    id: "mock-3",
    title: "Viagem para Europa",
    date: "Julho 2021",
    location: "Paris, França",
    people: ["Melhores amigos"],
    category: "travel",
    description: "Primeira viagem internacional! Paris foi mágica - cada rua, cada café, cada museu me encheu de inspiração. Realizei um sonho de infância.",
    image: "/placeholder.svg"
  },
  {
    id: "mock-4",
    title: "Casamento da Irmã",
    date: "Março 2022",
    location: "Rio de Janeiro, RJ",
    people: ["Família", "Primos", "Tios"],
    category: "personal",
    description: "Um dia repleto de emoção e alegria. Ver minha irmã realizando seu sonho de se casar foi inesquecível. A festa durou até o amanhecer!",
    image: "/placeholder.svg"
  },
  {
    id: "mock-5",
    title: "Promoção para Tech Lead",
    date: "Setembro 2023",
    location: "São Paulo, SP",
    category: "work",
    description: "Reconhecimento pelo trabalho árduo dos últimos anos. Assumir a liderança técnica da equipe trouxe novos desafios e responsabilidades que me motivam diariamente.",
  }
];
</script>

<style scoped>
.main {
  min-height: 100vh;
  background-color: hsl(var(--background));
}
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-background {
  background: url('~/assets/img/hero-memories.jpg') no-repeat center;
  background-size: cover;
}
.hero-background > div {
  background-image: var(--gradient-hero);
  opacity: .8;
}
.hero-background, .hero-background > div {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  margin: 0 auto;
  padding: 0 1rem;
  max-width: 56rem;
  animation: fade-in .8s ease-out;
}
h1 {
  font-size: 3.75rem;
  line-height: 1;
  color: hsl(var(--primary-foreground));
  font-weight: 700;
  margin-bottom: 2rem;
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / .04)) drop-shadow(0 4px 3px rgb(0 0 0 / .1));
}
h1 span {
  display: block;
  color: hsl(var(--gold-light));
  animation: float 6s ease-in-out infinite;
}
.hero-content p {
  font-size: 1.25rem;
  line-height: 1.625;
  color: hsl(var(--primary-foreground) / .9);
  max-width: 42rem;
  margin: 0 auto 3rem;
}
.hero-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.btn {
  font-size: 1.125rem;
  line-height: 1.75rem;
  height: 2.75rem;
}
.primary:hover {
  transform: scaleX(1.05) scaleY(1.05);
  backdrop-filter: blur(4px);
}
.float {
  position: absolute;
  border-radius: 9999px;
  animation: float 6s ease-in-out infinite;
}
.dot-1 {
  width: 1.5rem;
  height: 1.5rem;
  background-color: hsl(var(--gold));
  top: 5rem;
  left: 2.5rem;
  opacity: .7;
  animation-delay: 1s;
}
.dot-2{
  width: 1rem;
  height: 1rem;
  background-color: hsl(var(--pink-light));
  top: 10rem;
  right: 5rem;
  opacity: .6;
  animation-delay: 2s;
}
.dot-3 {
  width: 1.25rem;
  height: 1.25rem;
  background-color: hsl(var(--silver));
  bottom: 8rem;
  left: 25%;
  opacity: .5;
  animation-delay: 3s;
}
.features {
  padding: 5rem 1rem;
  background-color: hsl(var(--muted) / .3);
}
.section-wrapper {
  max-width: 72rem;
  margin: 0 auto;
}
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}
.section-header h2 {
  font-size: 2.25rem;
  line-height: 2.5rem;
  color: hsl(var(--foreground));
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.section-header h2 span {
  color: hsl(var(--gold));
}
.section-header p {
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: hsl(var(--muted-foreground));
  max-width: 42rem;
  margin: 0 auto;
}
.features-grid {
  display: grid;
  gap: 2rem;
}
.card {
  padding: 2rem;
}
.feature-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.feature-icon {
  padding: 1rem;
  border-radius: 9999px;
  background-color: hsl(var(--muted) / .5);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
  transition-duration: .3s;
}
.icon {
  width: 2rem;
  height: 2rem;
}
.card h3 {
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: hsl(var(--foreground));
  font-weight: 600;
  margin-top: 1rem;
}
.card p {
  color: hsl(var(--muted-foreground));
  line-height: 1.625;
  margin-top: 1rem;
}
.timeline {
  padding: 5rem 1rem;
  background-color: hsl(var(--background));
}
.timeline-wrapper {
  position: relative;
}
.line {
  position: absolute;
  display: none;
  left: 50%;
  transform: translateX(-50%);
  width: .25rem;
  height: 100%;
  background: var(--gradient-timeline);
  border-radius: 9999px;
  box-shadow: 0 2px 8px hsl(var(--gold) / .2);
  transform: translate(-50%, 0);
}
.item-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.memory-item {
  width: 100%;
}
.timeline-dot {
  display: none;
  justify-content: center;
}
.timeline-dot > div {
  width: 1rem;
  height: 1rem;
  background-color: hsl(var(--gold));
  border-radius: 9999px;
  box-shadow: 0 2px 8px hsl(var(--gold) / .2);
  border: 4px solid hsl(var(--background));
  z-index: 10;
}
.empty-space {
  display: none;
}
.cta {
  text-align: center;
  margin-top: 4rem;
}
.cta p {
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1.5rem;
}


@media (min-width: 640px) {
  .hero-buttons {
    flex-direction: row;
  }
}
@media (min-width: 768px) {
  h1 {
    font-size: 6rem;
    line-height: 1;
  }
  .hero-content p {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  .section-header h2 {
    font-size: 3.75rem;
    line-height: 1;
  }
  .features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .line {
    display: block;
  }
  .item-row.left {
    flex-direction: row;
  }
  .item-row.right {
    flex-direction: row-reverse;
  }
  .memory-item {
    width: 41.666667%;
  }
  .timeline-dot {
    display: flex;
    width: 16.666667%;
  }
  .empty-space {
    width: 41.666667%;
    display: block;
  }
}
@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
