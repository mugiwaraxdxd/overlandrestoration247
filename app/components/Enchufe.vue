<!-- Un enchufe doble americano, con su placa: el foco del moho de la pared -->
<template>
  <svg class="enchufe" viewBox="0 0 40 64" aria-hidden="true">
    <defs>
      <linearGradient id="placa-enchufe" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fbfaf7" />
        <stop offset="1" stop-color="#e9e7e1" />
      </linearGradient>
    </defs>
    <rect x=".5" y=".5" width="39" height="63" rx="3.5" fill="url(#placa-enchufe)" stroke="rgba(0,0,0,.14)" />
    <g fill="#f4f3ef" stroke="rgba(0,0,0,.16)" stroke-width=".6">
      <rect x="9" y="8" width="22" height="18" rx="7" />
      <rect x="9" y="38" width="22" height="18" rx="7" />
    </g>
    <g fill="#2b2b2b">
      <rect x="13.4" y="12" width="2.2" height="6.5" rx=".5" />
      <rect x="24.4" y="12" width="2.2" height="6.5" rx=".5" />
      <path d="M18.4 21.2a1.6 1.6 0 0 1 3.2 0v2h-3.2z" />
      <rect x="13.4" y="42" width="2.2" height="6.5" rx=".5" />
      <rect x="24.4" y="42" width="2.2" height="6.5" rx=".5" />
      <path d="M18.4 51.2a1.6 1.6 0 0 1 3.2 0v2h-3.2z" />
    </g>
    <circle cx="20" cy="32" r="1.6" fill="#d6d3cb" stroke="rgba(0,0,0,.2)" stroke-width=".5" />
    <path d="M19 32h2" stroke="rgba(0,0,0,.35)" stroke-width=".5" />
  </svg>
</template>

<style scoped>
.enchufe { filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, .22)); }
</style>
