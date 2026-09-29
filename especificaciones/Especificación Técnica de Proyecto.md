# Documento de Especificaciones Técnicas y Funcionales

**Proyecto:** PWA de Consulta de Precios, Escáner QR y Carrito de Compras  
**Tipo de Aplicación:** Progressive Web App (PWA) Offline-First  
**Plataformas Objetivo:** Android, iOS, Desktop (Multiplataforma)  
**Fecha:** Septiembre de 2026  

---

## 1. Resumen del Proyecto

El objetivo principal es construir una aplicación web progresiva (PWA) extremadamente ligera, rápida y fácil de mantener para la gestión y consulta de listas de precios en tiempo real mediante un buscador por texto o un escáner de códigos QR/barras.

Además de la consulta, la aplicación incluye la funcionalidad de un **Carrito de Compras / Tomador de Pedidos**, permitiendo acumular productos, ajustar cantidades, aplicar descuentos globales y calcular el importe total de la venta sin requerir conexión a internet ni un servidor backend activo.

---

## 2. Requerimientos Clave y Arquitectura

### 2.1 Principios de Diseño
* **Offline-First:** La app debe funcionar al 100% sin conexión a internet. Los datos residen en el almacenamiento interno del dispositivo.
* **Cero backend:** No se requiere servidor de base de datos ni API REST. La lógica y los datos corren de forma local en el navegador del cliente.
* **Sin cuentas de desarrollador:** Se distribuirá mediante una URL pública para su instalación directa ("Agregar a la pantalla de inicio").

### 2.2 Stack Tecnológico Recomendado

| Componente | Tecnología / Librería Recomendada | Justificación |
| :--- | :--- | :--- |
| **Framework Frontend** | Vue.js 3 (Composition API) + Vite | Reactivo, ultraliviano, excelente velocidad de compilación y soporte de PWA. |
| **Estilos CSS** | Tailwind CSS | Construcción rápida de UI responsiva con un bundle final de CSS mínimo. |
| **Base de Datos Local** | Dexie.js (`IndexedDB`) | Wrapper ligero sobre IndexedDB para consultas masivas en menos de 5 ms. |
| **Escáner QR / Barras** | `html5-qrcode` | Acceso a cámara, soporte para linterna/flash y compatible con iOS Safari y Android Chrome. |
| **Lector de Planillas** | `xlsx` (SheetJS) | Procesa archivos Excel (`.xlsx`) y CSV directamente en el cliente. |
| **PWA & Service Worker** | `vite-plugin-pwa` (Workbox) | Automatiza la generación de manifiestos y la estrategia de caché local. |

---

## 3. Modelo y Estructura de Datos

### 3.1 Esquema de Producto (`IndexedDB`)

Cada ítem almacenado en la tabla `productos` de `Dexie.js` debe respetar la siguiente estructura:

```typescript
interface Producto {
  id: string;                  // Código único / SKU (Contenido dentro del QR). Clave primaria.
  descripcion: string;         // Nombre / Descripción del producto
  precio: number;              // Precio unitario numérico (flotante)
  categoria?: string;          // Opcional: Categoria / Rubro
  unidad?: string;             // Opcional: Unidad, Kg, Litro, etc.
  ultimaModificacion?: string; // Timestamp de actualización ISO 8601
}
```

### 3.2 Esquema del Carrito de Compras (`LocalStorage` / `SessionStorage`)

Para mantener el carrito persistente ante cierres accidentales de la app:

```typescript
interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number; // producto.precio * cantidad
}

interface CarritoState {
  items: ItemCarrito[];
  descuentoTipo: 'porcentaje' | 'monto';
  descuentoValor: number; // Porcentaje (0-100) o monto ($)
  subtotal: number;       // Suma de subtotales
  montoDescuento: number; // Valor calculado del descuento aplicado
  total: number;          // Subtotal - montoDescuento
}
```

---

## 4. Módulos y Especificaciones Funcionales

### Módulo 1: Gestión de Lista e Importación de Precios
1. **Importación de Datos:**
   * Permitir la carga mediante un archivo `.xlsx` o `.csv` seleccionado desde el almacenamiento local del teléfono.
   * Modos de importación a selección del usuario:
     * **Reemplazar todo:** Vacía la base de datos y carga la nueva lista.
     * **Actualizar/Merge:** Si el código existe, actualiza el precio; si no existe, lo agrega.
2. **Importación vía Enlace (Opcional):**
   * Configurar una URL pública de Google Sheets en formato CSV para actualizar con un clic cuando haya conexión a internet.
3. **Respaldo:**
   * Permitir la exportación de los datos locales a un archivo JSON o CSV como copia de seguridad.

### Módulo 2: Búsqueda y Lista Principal
1. **Búsqueda por Texto:** Filtro dinámico e instantáneo mientras el usuario escribe en el campo de búsqueda (aplica sobre `id` y `descripcion`).
2. **Listado Optimizado:** Visualización de tarjetas compactas con código, descripción y precio destacado.
3. **Interacción:** Al tocar un producto de la lista, abre el modal para agregar al carrito especificando cantidad.

### Módulo 3: Escáner QR / Código de Barras
1. **Disparo de Cámara:** Botón Flotante (FAB) en la pantalla principal para abrir la cámara.
2. **Procesamiento en Tiempo Real:**
   * Al enfocar un QR, lee el string de datos (correspondiente al `id` / SKU).
   * Feedback hápico (vibración) o sonoro al detectar la lectura con éxito.
   * Búsqueda del producto en la base local en < 10 ms.
3. **Modal de Detalle / Añadir al Carrito:**
   * Muestra: Código, Descripción, Precio Unitario.
   * Campo selector de cantidad (`[-]` `[ 1 ]` `[+]` o input directo).
   * Muestra el subtotal dinámico.
   * Botón `[ Agregar al Carrito 🛒 ]`.
   * Opción de *"Seguir escaneando"* para no cerrar la cámara y continuar cargando productos rápidamente.

### Módulo 4: Carrito de Compras y Cierre de Venta
1. **Vista "Ver Carrito":**
   * Listado de ítems agregados con posibilidad de ajustar cantidades o eliminar un ítem individualmente (🗑️).
2. **Aplicación de Descuentos:**
   * Permite ingresar un descuento opcional por **porcentaje (%)** o por **monto fijo ($)**.
   * Recálculo en tiempo real del Subtotal, Descuento y Total Final.
3. **Acciones del Carrito:**
   * **Limpiar Carrito:** Alerta de confirmación previa antes de vaciar todos los artículos.
   * **Compartir / Finalizar (Opcional):** Formatea el pedido en texto plano y activa la API nativa `navigator.share()` para enviarlo por WhatsApp u otra app.

---

## 5. Diseño de Interfaz y Flujo de Pantallas (UI/UX)

```
+-------------------------------------------------------------+
|                     PANTALLA PRINCIPAL                      |
+-------------------------------------------------------------+
| [Mi Lista de Precios]                          [⚙️ Config]  |
| 📦 1,250 productos cargados                                 |
| +---------------------------------------------------------+ |
| | 🔍 Buscar por código o descripción...                  | |
| +---------------------------------------------------------+ |
|                                                             |
| +---------------------------------------------------------+ |
| | ART-00123                                   $ 2.450,00  | |
| | Yerba Mate 500g                                         | |
| +---------------------------------------------------------+ |
| | ART-00124                                   $ 3.100,50  | |
| | Aceite Girasol 1L                                       | |
| +---------------------------------------------------------+ |
|                                                             |
|                                         [🛒 Carrito (3)]    |
|                                         [📷 Escanear QR]    |
+-------------------------------------------------------------+
```

### Detalle de Vistas

1. **Pantalla Principal (Lista):**
   * Header con estado de base de datos y acceso a Configuración.
   * Barra de búsqueda superior fija.
   * Botón flotante del escáner QR en la esquina inferior derecha.
   * Botón flotante / contador del carrito activo en la zona inferior.

2. **Modal de Escáner:**
   * Visor de cámara en pantalla completa o modal amplio.
   * Marcos guía para el encuadre.
   * Botón de activación de Flash/Linterna.
   * Botón para cerrar el lector.

3. **Modal de Carrito de Compras:**
   * Lista en formato tabla de productos agregados.
   * Selector tipo radio para aplicar descuento (% o $).
   * Resumen claro: `Subtotal` - `Descuento` = **`TOTAL`**.
   * Botones de acción inferiores: `[ 🗑️ Limpiar ]` y `[ 📄 Compartir ]`.

4. **Vista de Configuración e Importación:**
   * Selector de archivos para subir `.xlsx` o `.csv`.
   * Radio button para elegir método (Reemplazar vs. Actualizar).
   * Botones de administración: Copia de seguridad y vaciado de BD.

---

## 6. Consideraciones para iOS y Android

* **Safari en iOS:**
  * Solicitar permisos de cámara de forma explícita ante la primera acción del usuario.
  * La PWA debe configurar los *meta tags* correctos para pantalla completa (`apple-mobile-web-app-capable`).
* **Android (Chrome):**
  * Incluir archivo `manifest.webmanifest` con iconos en resoluciones `192x192` y `512x512` para habilitar el banner automático de instalación.

---

## 7. Plan de Entregables para el Desarrollador

1. **Fase 1: Setup y PWA Base**
   * Proyecto en Vue 3 + Vite configurado con `vite-plugin-pwa` y Tailwind CSS.
   * Configuración de la base de datos `Dexie.js`.
2. **Fase 2: Importador y Búsqueda**
   * Lógica de parseo de planillas Excel con `SheetJS`.
   * Interfaz de la lista principal con filtrado en tiempo real.
3. **Fase 3: Escáner QR**
   * Integración de `html5-qrcode` y vinculación con la búsqueda en la BD local.
   * Modal emergente de producto encontrado.
4. **Fase 4: Carrito y Descuentos**
   * Estado global del carrito y persistencia en `LocalStorage`.
   * Pantalla de detalle de carrito, cálculo de totales y descuentos.
   * Función de vaciado y compartir pedido.