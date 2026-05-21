import { useEffect, useState } from 'react';
import { creatorService } from '../services/creator.service';
import { BarChart3, Calendar, Search, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { IncomeReport } from '../../../types';

export const CreatorReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<IncomeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const filters: { start_date?: string; end_date?: string } = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;

      const data = await creatorService.getIncomeReport(filters);
      setReport(data.report);
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  };
  // AÑADIR ESTO: Ejecutar la búsqueda automáticamente al cargar la pantalla
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporte de Ingresos</h1>
          <p className="text-sm text-gray-500">Consulta tus donaciones recibidas en un rango de fechas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtrar por fecha</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
            />
          </div>
          <Button onClick={handleSearch} isLoading={loading} className="!w-auto">
            <Search className="w-4 h-4 mr-2" />
            Consultar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
            <p className="text-purple-100 text-sm font-medium">Total Flanes</p>
            <p className="text-3xl font-bold mt-1">{report.total_flanes} 🍮</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
            <p className="text-emerald-100 text-sm font-medium">Valor Total</p>
            <p className="text-3xl font-bold mt-1">
              {report.total_value} {report.currency}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-amber-100" />
              <p className="text-amber-100 text-sm font-medium">Donaciones</p>
            </div>
            <p className="text-3xl font-bold mt-1">{report.donations.length}</p>
          </div>
        </div>
      )}

      {/* Donations Table */}
      {hasSearched && report && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Historial de Donaciones</h3>
          </div>
          {report.donations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay donaciones en el rango seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Seguidor
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Flanes
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {donation.follower_name || `Seguidor #${donation.follower_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {donation.flanes} 🍮
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(donation.donated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Selecciona un rango de fechas</p>
          <p className="text-gray-400 text-sm mt-1">
            O haz click en "Consultar" sin filtros para ver todas las donaciones
          </p>
        </div>
      )}
    </div>
  );
};
