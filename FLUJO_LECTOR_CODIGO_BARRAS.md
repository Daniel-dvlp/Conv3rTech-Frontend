# Flujo de Implementación del Lector de Código de Barras (Datalogic HID)

## 📋 Descripción General

Este documento explica cómo funciona la integración del lector de código de barras Datalogic configurado como dispositivo HID (Human Interface Device) en el módulo de productos.

## 🔧 Configuración del Lector

El lector Datalogic está configurado para funcionar como un **teclado virtual**. Esto significa que:
- Cuando escaneas un código, el lector envía los caracteres como si fueran tecleados
- Al finalizar, envía una tecla **Enter** automáticamente
- No requiere drivers especiales ni configuración adicional en el navegador

## 🔄 Flujo de Funcionamiento

### 1. **Detección del Escaneo**
```
Usuario escanea código → Lector envía caracteres rápidamente → Hook detecta secuencia
```

### 2. **Proceso del Hook (`useBarcodeScanner`)**

El hook funciona de la siguiente manera:

1. **Escucha eventos `keypress`** a nivel global de la ventana
2. **Filtra eventos** para ignorar:
   - Textareas (campos de texto largo)
   - Inputs que NO sean el campo `codigo_barra`
   - Permite el campo con `id="codigo_barra"` para que el usuario pueda escribir manualmente si es necesario

3. **Acumula caracteres** cuando detecta una secuencia rápida:
   - Inicia un contador cuando recibe el primer carácter
   - Acumula todos los caracteres siguientes
   - Usa un timeout de 100ms para diferenciar entre escaneo rápido y escritura manual

4. **Finaliza el escaneo** cuando:
   - Detecta la tecla **Enter** (enviada automáticamente por el lector)
   - Valida que el código tenga al menos 3 caracteres (configurable)

5. **Ejecuta el callback** con el código completo escaneado

### 3. **Integración en los Modales**

#### NewProductModal (Crear Producto)
```javascript
useBarcodeScanner(
    (scannedCode) => {
        // El código escaneado se asigna automáticamente al campo
        setProductData((prev) => ({
            ...prev,
            codigo_barra: scannedCode
        }));
    },
    {
        minLength: 3,        // Código mínimo de 3 caracteres
        scanDuration: 100,  // 100ms entre caracteres
        enabled: isOpen     // Solo activo cuando el modal está abierto
    }
);
```

#### ProductEditModal (Editar Producto)
```javascript
// Misma implementación que NewProductModal
```

## 🎯 Características del Hook

### Opciones de Configuración

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `minLength` | number | 3 | Longitud mínima del código de barras |
| `scanDuration` | number | 100 | Tiempo máximo (ms) entre caracteres para considerar un escaneo |
| `enabled` | boolean | true | Activar/desactivar el hook |

### Comportamiento Inteligente

✅ **Distingue entre escaneo y escritura manual:**
- Escaneo: caracteres muy rápidos (< 100ms entre cada uno)
- Escritura manual: caracteres más lentos, se ignoran

✅ **Permite escritura manual en el campo:**
- El campo `codigo_barra` puede seguir siendo editado manualmente
- El hook solo captura escaneos rápidos

✅ **Solo activo cuando es necesario:**
- Se activa solo cuando el modal está abierto
- No interfiere con otras partes de la aplicación

## 📝 Uso Práctico

### Escenario 1: Escanear código al crear producto
1. Abre el modal "Crear Producto"
2. **No es necesario** hacer clic en el campo "Código de barra"
3. Escanea el código con el lector Datalogic
4. El código aparece automáticamente en el campo
5. Continúa llenando el resto del formulario

### Escenario 2: Escanear código al editar producto
1. Abre el modal "Editar Producto"
2. Escanea el código con el lector
3. El código se actualiza automáticamente
4. Guarda los cambios

### Escenario 3: Escribir código manualmente
1. Haz clic en el campo "Código de barra"
2. Escribe el código manualmente
3. El hook no interfiere con la escritura manual

## 🔍 Debugging

Si el lector no funciona, verifica:

1. **Consola del navegador:**
   ```javascript
   // El hook imprime en consola cuando detecta un escaneo
   console.log('Código escaneado:', scannedCode);
   ```

2. **Configuración del lector:**
   - Verifica que esté configurado como HID/Keyboard
   - Verifica que envíe Enter al finalizar

3. **Campo correcto:**
   - El campo debe tener `id="codigo_barra"`
   - El modal debe estar abierto (`isOpen = true`)

## ⚙️ Ajustes Avanzados

Si necesitas ajustar el comportamiento:

### Aumentar sensibilidad (detectar escaneos más lentos)
```javascript
useBarcodeScanner(
    onScan,
    {
        scanDuration: 200  // Aumenta a 200ms
    }
);
```

### Códigos más cortos
```javascript
useBarcodeScanner(
    onScan,
    {
        minLength: 1  // Permite códigos de 1 carácter
    }
);
```

### Desactivar temporalmente
```javascript
useBarcodeScanner(
    onScan,
    {
        enabled: false  // Desactiva el hook
    }
);
```

## 🚀 Ventajas de esta Implementación

1. ✅ **No requiere configuración adicional** del lector
2. ✅ **Compatible con cualquier lector HID** (no solo Datalogic)
3. ✅ **No interfiere con la escritura manual**
4. ✅ **Funciona automáticamente** cuando el modal está abierto
5. ✅ **Fácil de mantener y extender**

## 📌 Notas Importantes

- El hook está diseñado para trabajar con lectores que envían **Enter** al finalizar
- Si tu lector no envía Enter, el código se capturará después del timeout (100ms)
- El campo `codigo_barra` puede seguir siendo editado manualmente sin problemas
- El hook solo se activa cuando `enabled: true` y el modal está abierto

