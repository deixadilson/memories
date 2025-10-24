<script setup lang="ts">
const navLinks = [
  { to: '/dashboard', icon: 'lucide:home', label: 'Dashboard' },
  { to: '/dashboard/periods', icon: 'lucide:clock', label: 'Períodos' },
  { to: '/dashboard/memories', icon: 'lucide:image', label: 'Memórias' },
  { to: '/dashboard/people', icon: 'lucide:users', label: 'Pessoas' },
];
</script>

<template>
  <div class="dashboard-layout">
    <header class="header">
      <div class="container">
        <NuxtLink to="/dashboard" class="logo">
          Memórias
        </NuxtLink>
        <nav>
          <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
            <Icon :name="link.icon" class="icon" />
            <span class="label">{{ link.label }}</span>
          </NuxtLink>
        </nav>
        <UserDropdown />
      </div>
    </header>
    <main class="main-content container">
      <slot />
    </main>
    <nav class="mobile-nav">
      <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
        <Icon :name="link.icon" class="icon" />
        <span class="label">{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
}
.header {
  background-color: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
  box-shadow: 0 4px 20px hsl(var(--gold) / .1);
  position: sticky;
  top: 0;
  z-index: 50;
}
.header > .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: 0 1rem;
  height: 4rem;
}
.logo {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: transparent;
  background-image: linear-gradient(to right, hsl(var(--gold)), hsl(var(--pink-light)));
  background-clip: text;
}
nav {
  display: none;
  align-items: center;
}
.nav-link {
  display: flex;
  align-items: center;
  color: hsl(var(--foreground));
  transition: color 0.15s cubic-bezier(.4, 0, .2, 1);
}
.nav-link:not(:first-child) {
  margin-left: 1.5rem;
}
.nav-link span {
  margin-left: .5rem;
}
.main-content {
  margin: 0 auto;
  padding: 2rem 1rem;
}


.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background-color: hsl(var(--card));
  border-top: 1px solid hsl(var(--border));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}
.mobile-nav .nav-link {
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  text-decoration: none;
  color: hsl(var(--muted-foreground));
}
.mobile-nav .icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-bottom: .25rem;
}
.mobile-nav .label {
  font-size: .65rem;
  font-weight: 500;
}
.mobile-nav .router-link-exact-active {
  color: hsl(var(--gold));
}
.nav-link:hover {
  color: hsl(var(--gold));
}


.main-content :deep(.page-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.main-content :deep(h1) {
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 700;
  margin-bottom: .5rem;
}
.main-content :deep(p) {
  color: hsl(var(--muted-foreground));
}


@media (min-width: 1400px) {
  .container {
    max-width: 1400px;
  }
}
@media (min-width: 768px) {
  nav {
    display: flex;
  }
}
@media (max-width: 767px) {
  .desktop-nav {
    display: none;
  }
  .mobile-nav {
    display: flex;
    justify-content: space-around;
  }
}
</style>
