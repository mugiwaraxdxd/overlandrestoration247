<script setup>
// La etiqueta de estado de una escena: el problema (punto naranja) o «hecho» (punto verde)
defineProps({
  texto: { type: String, required: true },
  hecho: { type: String, required: true },
  listo: { type: Boolean, default: false },
  dato: { type: String, default: '' }     // una lectura que cambia (38 %, «Poor»…)
})
</script>

<template>
  <div class="estado" :class="{ listo }">
    <span class="punto" />
    <span class="caras">
      <span class="cara antes">{{ texto }}</span>
      <span class="cara despues">{{ hecho }}</span>
    </span>
    <b v-if="dato" class="dato">{{ dato }}</b>
  </div>
</template>

<style scoped>
.estado {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px 0 10px;
  border-radius: var(--pildora);
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 2px 10px rgba(15, 36, 64, .14);
  font-size: 13px;
  font-weight: 700;
  color: var(--tinta);
  pointer-events: none;
}
.punto { width: 8px; height: 8px; border-radius: 50%; background: var(--naranja); transition: background-color .35s var(--curva); }
.listo .punto { background: var(--verde); }
.caras { display: grid; }
.cara { grid-area: 1 / 1; white-space: nowrap; transition: opacity .3s var(--curva), transform .3s var(--curva); }
.despues { opacity: 0; transform: translateY(6px); color: var(--verde); }
.listo .antes { opacity: 0; transform: translateY(-6px); }
.listo .despues { opacity: 1; transform: none; }
.dato { padding-left: 8px; border-left: 1px solid var(--linea); font-variant-numeric: tabular-nums; }
</style>
