import { useState, useEffect } from 'react';
import { cardApi } from './services/api';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await cardApi.getAll();
      setCards(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {cards.map((card) => {
        const isFlipped = flippedCards[card._id] || false;

        return (
          <div
            key={card._id}
            className="group [perspective:1000px]"
            onClick={() =>
              setFlippedCards((prev) => ({
                ...prev,
                [card._id]: !prev[card._id],
              }))
            }
          >
            <div
              className={`
                relative h-64 w-full transition-transform duration-700
                [transform-style:preserve-3d]
                ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
              `}
            >
              {/* FRONT */}
              <div className="absolute inset-0 bg-slate-950 border border-slate-700 rounded-xl p-6 backface-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-medium px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">
                    {card.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    {'★'.repeat(card.difficulty)}
                  </span>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-3">
                  {card.front}
                </h3>
              </div>

              {/* BACK */}
              <div
                className="absolute inset-0 bg-slate-900 border border-indigo-500 rounded-xl p-6 
                              [transform:rotateY(180deg)] backface-hidden"
              >
                <p className="text-sm text-slate-300">{card.back}</p>

                {card.reviewStats?.timesReviewed > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
                    Reviewed {card.reviewStats.timesReviewed} times •{' '}
                    {card.mastery}% mastery
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;
