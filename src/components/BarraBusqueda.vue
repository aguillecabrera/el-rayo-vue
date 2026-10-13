<template>
  <div class="px-4 py-2 bg-white shadow-sm">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      placeholder="🔍 Buscar por código o descripción..."
      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <select
      :value="proveedor"
      @input="$emit('update:proveedor', $event.target.value)"
      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
    >
      <option value="Todos">Todos</option>
      <option value="70/30">70/30</option>
      <option value="Domfer">Domfer</option>
      <option value="GFP">GFP</option>
      <option value="Venti">Venti</option>
      <option value="Reginato">Reginato</option>
      <option value="ElRayo">ElRayo</option>

    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  proveedor: {
    type: String,
    default: 'Todos'
  }
})
defineEmits(['update:modelValue', 'update:proveedor'])
</script>
