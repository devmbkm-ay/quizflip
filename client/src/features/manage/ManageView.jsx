import { useApp } from '../../contexts/AppContext.jsx';
import { CardManager } from '../../components/cards/CardManager.jsx';
import { CardDashboard } from '../../components/cards/CardDashboard.jsx';
import { AutoGenerate } from '../../components/cards/AutoGenerate.jsx';
// import { SearchBar } from '../../components/ui/SearchBar';

export function ManageView() {
  const {
    show,
    refresh,
    setView,
  } = useApp();

  const handleCardCreated = async () => {
    try {
      await refresh();
      show('Card created successfully!');
    } catch (err) {
      show(err.message, 'error');
    }
  };

  const handleCardsCreated = async (cards = []) => {
    try {
      await refresh();
      const count = Array.isArray(cards) ? cards.length : 1;
      show(`${count} card${count > 1 ? 's' : ''} created successfully!`);
    } catch (err) {
      show(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* <h2 className="text-2xl font-bold text-white">Manage Cards</h2> */}
        {/* <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search cards..."
        /> */}
        {/* <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cards..."
          className="px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm"
        /> */}
      </div>

      <CardManager
        onCardsChange={refresh}
        onBack={() => setView('study')}
      />

      <CardDashboard onCardCreated={handleCardCreated} />
      <AutoGenerate onCardsCreated={handleCardsCreated} />
    </div>
  );
}
