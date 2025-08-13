<script setup>
// O router-view irá renderizar o componente apropriado
</script>

<template>
  <div class="app-background">
    <router-view />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

.app-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #111827 0%, #000000 50%, #1f2937 100%);
  font-family: 'Inter', sans-serif;
}

body {
  font-family: 'Inter', sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>
