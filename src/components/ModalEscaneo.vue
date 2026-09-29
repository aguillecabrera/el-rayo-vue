<template>
  <div class="fixed inset-0 z-50 bg-black/80 flex flex-col">
    <div class="flex justify-between items-center px-4 py-2 bg-gray-900 text-white">
      <span class="font-medium">Escanear QR / Código</span>
      <button @click="cerrar" class="text-white text-2xl">&times;</button>
    </div>
    <div id="scanner-container" ref="scannerEl" class="flex-1"></div>
    <div class="bg-gray-900 px-4 py-3 flex justify-center gap-4">
      <button @click="toggleFlash" class="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium">
        {{ flashOn ? '💡 Apagar Flash' : '💡 Flash' }}
      </button>
      <button @click="cerrar" class="px-4 py-2 bg-gray-600 text-white rounded-lg">Cancelar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { db } from '../db.js'

const emit = defineEmits(['cerrar', 'producto-escaneado'])
const scannerEl = ref(null)
const flashOn = ref(false)
let html5QrCode = null

onMounted(async () => {
  if (!scannerEl.value) return
  html5QrCode = new Html5Qrcode('scanner-container')
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    formatsToSupport: [0, 1]  // QR_CODE, CODE_128
  }
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      config,
      onScanSuccess
    )
  } catch (err) {
    console.error('Error iniciando cámara', err)
    alert('No se pudo acceder a la cámara. Verifica los permisos.')
    emit('cerrar')
  }
})

onUnmounted(() => {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {})
  }
})

async function onScanSuccess(decodedText) {
  // Buscar producto
  try {
    const producto = await db.productos.get(decodedText)
    if (producto) {
      // Vibrar
      if (navigator.vibrate) navigator.vibrate(200)
      emit('producto-escaneado', producto)
    } else {
      alert('Producto no encontrado: ' + decodedText)
    }
  } catch (e) {
    console.error(e)
  }
}

function toggleFlash() {
  if (html5QrCode) {
    html5QrCode.getRunningTrackCapabilities().then(cap => {
      if (cap.torch) {
        html5QrCode.applyVideoConstraints({ advanced: [{ torch: flashOn.value ? false : true }] })
        flashOn.value = !flashOn.value
      } else {
        alert('Este dispositivo no soporta flash')
      }
    })
  }
}

function cerrar() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      emit('cerrar')
    }).catch(() => emit('cerrar'))
  } else {
    emit('cerrar')
  }
}
</script>
