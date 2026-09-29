<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold text-gray-800">El Rayo</h1>
      <button @click="openConfig = true" class="text-gray-500 hover:text-gray-700 text-xl">⚙️</button>
    </header>

    <!-- Estado de la BD -->
    <div class="px-4 py-2 text-xs text-gray-500 bg-gray-100 flex items-center justify-between">
      <span>{{ productosCount }} productos cargados</span>
      <span v-if="ultimaActualizacion">Últ. act.: {{ ultimaActualizacion }}</span>
    </div>

    <!-- Barra búsqueda -->
    <BarraBusqueda v-model="terminoBusqueda" />

    <!-- Lista productos -->
    <ListaProductos :termino="terminoBusqueda" @producto-seleccionado="abrirModalProducto" />

    <!-- Botones flotantes -->
    <div class="fixed bottom-6 right-4 flex flex-col gap-3 z-40">
      <button @click="abrirCarrito" class="bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl relative">
        🛒
        <span v-if="carrito.state.items.length > 0" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{{ carrito.state.items.length }}</span>
      </button>
      <button @click="abrirScanner" class="bg-green-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl">
        📷
      </button>
    </div>

    <!-- Modal escáner -->
    <ModalEscaneo v-if="showScanner" @cerrar="showScanner=false" @producto-escaneado="onProductoEscaneado" />

    <!-- Modal producto -->
    <ModalProducto v-if="productoSeleccionado" :producto="productoSeleccionado" @cerrar="productoSeleccionado=null" @agregar="agregarAlCarrito" />

    <!-- Modal carrito -->
    <ModalCarrito v-if="showCarrito" @cerrar="showCarrito=false" />

    <!-- Modal configuración -->
    <Configuracion v-if="openConfig" @cerrar="openConfig=false" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import BarraBusqueda from './BarraBusqueda.vue'
import ListaProductos from './ListaProductos.vue'
import ModalEscaneo from './ModalEscaneo.vue'
import ModalProducto from './ModalProducto.vue'
import ModalCarrito from './ModalCarrito.vue'
import Configuracion from './Configuracion.vue'
import { zustandCarrito } from '../stores/carrito.js'

const carrito = zustandCarrito()
provide('carrito', carrito)

const terminoBusqueda = ref('')
const productosCount = ref(0)
const ultimaActualizacion = ref('')
const showScanner = ref(false)
const productoSeleccionado = ref(null)
const showCarrito = ref(false)
const openConfig = ref(false)

// Escuchar eventos de recarga de datos (desde Configuracion)
window.addEventListener('db-updated', () => {
  actualizarContadores()
})

function abrirScanner() {
  showScanner.value = true
}

function onProductoEscaneado(producto) {
  // Cerrar scanner y abrir modal producto
  showScanner.value = false
  productoSeleccionado.value = producto
}

function abrirModalProducto(producto) {
  productoSeleccionado.value = producto
}

function abrirCarrito() {
  showCarrito.value = true
}

function agregarAlCarrito({ producto, cantidad }) {
  carrito.agregarProducto(producto, cantidad)
  productoSeleccionado.value = null
  // Opcional: mostrar toast
}

async function actualizarContadores() {
  const { db } = await import('../db.js')
  const count = await db.productos.count()
  productosCount.value = count
  if (count > 0) {
    const ultimo = await db.productos.orderBy('ultimaModificacion').last()
    ultimaActualizacion.value = ultimo?.ultimaModificacion ? new Date(ultimo.ultimaModificacion).toLocaleString() : ''
  } else {
    ultimaActualizacion.value = ''
  }
}

actualizarContadores()

// Recargar contadores cada 30s
setInterval(actualizarContadores, 30000)

</script>
