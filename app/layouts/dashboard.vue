<template>
  <div class="dashboard-layout">
    <header class="header">
      <div class="container">
        <NuxtLink to="/dashboard" class="logo">
          Memórias
        </NuxtLink>
        <nav>
          <NuxtLink to="/dashboard" class="nav-link">
            <Icon name="lucide:house" />
            <span>Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/periods" class="nav-link">
            <Icon name="lucide:clock" />
            <span>Períodos</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/memories" class="nav-link">
            <Icon name="lucide:image" />
            <span>Memórias</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/people" class="nav-link">
            <Icon name="lucide:users" />
            <span>Pessoas</span>
          </NuxtLink>
        </nav>
        <UserDropdown />
      </div>
    </header>
    <main class="main-content container">
      <slot />
    </main>
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
.nav-link:hover {
  color: hsl(var(--gold));
}
.nav-link span {
  margin-left: .5rem;
}
.main-content {
  margin: 0 auto;
  padding: 2rem 1rem;
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
</style>
