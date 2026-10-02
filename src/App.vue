<template>
  <PantallaPrincipal />
</template>

<script setup>
import PantallaPrincipal from './components/PantallaPrincipal.vue'
import { zustandCarrito } from './stores/carrito.js'
import { db } from './db.js'

// Inicializar store y db al arrancar
const carrito = zustandCarrito()
carrito.cargarDesdeLocalStorage()

// Exportar db para debug opcional
window.__DB__ = db
</script>
