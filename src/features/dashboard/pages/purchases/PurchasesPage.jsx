import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaSearch, FaFileExport } from 'react-icons/fa';
import PurchasesTable from './components/PurchasesTable';
import SkeletonPurchaseRow from './components/SkeletonRow';
import { mockPurchases } from './data/Purchases_data';
import Pagination from '../../../../shared/components/Pagination';
import PurchaseDetailModal from './components/PurchasesDetailModal';
import NewPurchaseModal from './components/NewPurchasesModal';

const ITEMS_PER_PAGE = 5;

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Control modal creación
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);

  // Simulamos proveedores y productos para el selector (puedes ajustar)
  const providers = [
    { name: 'Distribuidora Central', nit: '900123456' },
    { name: 'Suministros del Norte', nit: '900654321' },
    { name: 'Importaciones Globales', nit: '900987654' },
  ];

  const productsList = [
    { id: '1', name: 'Filtro de aceite' },
    { id: '2', name: 'Aceite lubricante' },
    { id: '3', name: 'Tornillos galvanizados' },
    { id: '4', name: 'Arandelas' },
    { id: '5', name: 'Panel eléctrico' },
    // etc...
  ];

  useEffect(() => {
    // Simula carga de datos con delay
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) =>
    (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredPurchases = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    return purchases.filter((p) =>
      normalize(String(p.id)).includes(normalizedSearch) ||
      normalize(p.receiptNumber).includes(normalizedSearch) ||
      normalize(p.supplier).includes(normalizedSearch)
    );
  }, [purchases, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  }, [filteredPurchases]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPurchases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPurchases, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Guardar nueva compra recibida desde el modal
  const handleSavePurchase = (newPurchase) => {
    // Agregamos un id nuevo simple
    const newId = purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1;

    // Obtener nombre proveedor desde nit
    const providerObj = providers.find(p => p.nit === newPurchase.supplierNIT);
    const supplierName = providerObj ? providerObj.name : 'Proveedor desconocido';

    const purchaseToAdd = {
      id: newId,
      receiptNumber: newPurchase.receiptNumber,
      supplier: supplierName,
      registrationDate: newPurchase.registrationDate,
      products: newPurchase.products.map(p => ({
        product: productsList.find(prod => prod.id === p.productId)?.name || 'Producto desconocido',
        quantity: p.quantity,
        price: p.price,
      })),
      subtotal: newPurchase.subtotal,
      iva: newPurchase.iva,
      total: newPurchase.total,
      observations: '', // puedes agregar si lo tienes
    };

    setPurchases(prev => [purchaseToAdd, ...prev]);
    setIsNewPurchaseOpen(false);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Compras</h1>
        <div className="flex gap-4 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por ID, recibo, proveedor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar compra"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setIsNewPurchaseOpen(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus />
            Nueva Compra
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaFileExport />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabla o Skeleton */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de Recibo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Registro</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(ITEMS_PER_PAGE)].map((_, idx) => (
                <SkeletonPurchaseRow key={idx} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <PurchasesTable purchases={currentItems} onViewDetails={setSelectedPurchase} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Modal de detalles */}
      <PurchaseDetailModal
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />

      {/* Modal de nueva compra */}
      <NewPurchaseModal
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
        onSave={handleSavePurchase}
        existingPurchases={purchases.map(p => ({
          receiptNumber: p.receiptNumber,
          supplierNIT: providers.find(pr => pr.name === p.supplier)?.nit || '',
          registrationDate: p.registrationDate,
        }))}
        providers={providers}
        productsList={productsList}
      />
    </div>
  );
};

export default PurchasesPage;
