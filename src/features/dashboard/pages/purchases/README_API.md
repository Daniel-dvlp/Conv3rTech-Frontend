# Integración con API de Compras (Purchases)

## Descripción
Este módulo está completamente integrado con la API de compras desplegada en `https://backend-conv3rtech.onrender.com/api/purchases`.

## Servicios Implementados

### purchasesApi.js
- `getAllPurchases()` - Obtener todas las compras
- `getPurchaseById(id)` - Obtener compra por ID
- `createPurchase(purchaseData)` - Crear nueva compra
- `updatePurchase(id, purchaseData)` - Actualizar compra
- `deletePurchase(id)` - Eliminar compra
- `changePurchaseStatus(id, newStatus)` - Cambiar estado

## Hooks Implementados

### usePurchases.js
Hook que maneja operaciones CRUD, transformación de datos y estados de carga.

## Endpoints Utilizados

- `GET /api/purchases` - Listar compras
- `POST /api/purchases` - Crear compra
- `GET /api/purchases/:id` - Obtener compra
- `PUT /api/purchases/:id` - Actualizar compra
- `DELETE /api/purchases/:id` - Eliminar compra
- `PATCH /api/purchases/state/:id` - Cambiar estado

## Características

- Transformación automática de datos entre frontend y backend
- Gestión de stock automática al crear compras
- Estados: Registrada, Anulada, Completada
- Exportación a Excel mantenida
- Sin datos locales, todo desde backend de Render

