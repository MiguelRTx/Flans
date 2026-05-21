import { useEffect, useState } from 'react';
import { followerService } from '../services/follower.service';
import { Receipt, Calendar, Search, User, X, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { Donation, DonationSummary, CreatorListItem } from '../../../types';

export const FollowerDonations = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [allCreators, setAllCreators] = useState<CreatorListItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      handleSearch();
      try {
        const data = await followerService.getAllCreators();
        setAllCreators(data.creators);
      } catch (error) {
        console.error('Error cargando lista de creadores:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const filters: { start_date?: string; end_date?: string; creator_name?: string } = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (creatorName.trim()) filters.creator_name = creatorName.trim();
      
      const data = await followerService.getDonationHistory(filters);
      setDonations(data.donations);
      setSummary(data.summary);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = allCreators.filter(creator => {
    const searchStr = creatorName.toLowerCase();
    const name = (creator.display_name || '').toLowerCase();
    const user = (creator.username || '').toLowerCase();
    return name.includes(searchStr) || user.includes(searchStr);
  });

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('es-BO', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-200/50">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Historial de Donaciones</h1>
            <p className="text-sm text-gray-600">Consulta todas tus donaciones realizadas</p>
          </div>
        </div>
        {summary && (
          <div className="hidden sm:flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium">{summary.total_flanes} flanes total</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="relative z-50 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/80 p-6 shadow-sm overflow-visible">
        <div className="flex items-center space-x-2 mb-5">
          <div className="p-1.5 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-bold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 focus:bg-white outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 focus:bg-white outline-none transition-all text-sm"
            />
          </div>
          
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Creador</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input 
                type="text" 
                value={creatorName} 
                onChange={e => {
                  setCreatorName(e.target.value);
                  setShowDropdown(true);
                }} 
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Buscar creador..." 
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 focus:bg-white outline-none transition-all text-sm" 
              />
              {creatorName && (
                <button 
                  onClick={() => setCreatorName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showDropdown && creatorName && filteredCreators.length > 0 && (
              <ul className="absolute z-20 w-full mt-1.5 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-gray-50">
                {filteredCreators.map(c => (
                  <li 
                    key={c.id} 
                    onMouseDown={() => {
                      setCreatorName(c.display_name || c.username || '');
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors"
                  >
                    <img 
                      src={c.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.display_name || c.username || 'C')}&size=128&background=10b981&color=fff&bold=true`} 
                      className="w-9 h-9 rounded-lg mr-3 object-cover ring-1 ring-gray-100"
                      alt="Avatar"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{c.display_name || c.username}</span>
                      <span className="text-xs text-gray-400">@{c.username}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-0 select-none pointer-events-none">
              Alineación
            </label>
            <Button 
              onClick={handleSearch} 
              isLoading={loading} 
              className="w-full py-2.5 text-sm flex justify-center items-center !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!from-emerald-600 hover:!to-teal-700 !shadow-md !shadow-emerald-200/50 !rounded-xl border border-transparent"
            >
              <Search className="w-4 h-4 mr-2" />
              Consultar
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Total Flanes</p>
            <p className="text-3xl font-extrabold mt-1.5">{summary.total_flanes} 🍮</p>
          </div>
          <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Valor Total</p>
            <p className="text-3xl font-extrabold mt-1.5">{summary.total_value} {summary.currency}</p>
          </div>
          <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Donaciones</p>
            </div>
            <p className="text-3xl font-extrabold mt-1.5">{donations.length}</p>
          </div>
        </div>
      )}

      {/* Donations Table */}
      {hasSearched && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100/80 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Detalle de Donaciones</h3>
            <span className="text-xs text-gray-400 font-medium">{donations.length} registros</span>
          </div>
          {donations.length === 0 ? (
            <div className="p-10 text-center">
              <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No hay donaciones con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Creador</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Flanes</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {donations.map(d => (
                    <tr key={d.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {d.creator_display_name || d.creator_username || `Creador #${d.creator_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100">
                          {d.flanes} 🍮
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {fmt(d.donated_at)}
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
        <div className="relative bg-white/70 backdrop-blur-sm p-14 rounded-3xl border border-white shadow-xl text-center overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-200/30 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="inline-block p-4 bg-emerald-50 rounded-2xl mb-4">
              <Receipt className="w-10 h-10 text-emerald-300" />
            </div>
            <p className="text-gray-700 text-xl font-bold">Consulta tu historial</p>
            <p className="text-gray-400 text-sm mt-2">Haz click en "Consultar" para ver tus donaciones</p>
          </div>
        </div>
      )}
    </div>
  );
};