import { useApp } from '../../contexts/AppContext.jsx';
import { CardManager } from '../../components/cards/CardManager';
import { CardDashboard } from '../../components/cards/CardDashboard';
import { AutoGenerate } from '../../components/cards/AutoGenerate';
// import { SearchBar } from '../../components/ui/SearchBar';

export function ManageView() {
  const {
    filteredItems: cards,
    categories,
    loading,
    createCard,
    updateCard,
    deleteCard,
    show,
    // search,
    // setSearch,
    filter,
    setFilter,
    // refresh,
  } = useApp();

  const handleCreate = async (data) => {
    try {
      await createCard(data);
      show('Card created successfully!');
    } catch (err) {
      show(err.message, 'error');
      throw err;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateCard(id, data);
      show('Card updated!');
    } catch (err) {
      show(err.message, 'error');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCard(id);
      show('Card deleted');
    } catch (err) {
      show('Failed to delete', 'error');
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
        cards={cards}
        categories={categories}
        loading={loading}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        selectedCategory={filter}
        onCategoryChange={setFilter}
      />

      <CardDashboard onCardCreated={handleCreate} />
      <AutoGenerate onCardsCreated={handleCreate} />
    </div>
  );
}
