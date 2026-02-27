import { useApp } from '../../contexts/AppContext.jsx';
import { StudyView } from '../../features/study/StudyView.jsx';
import { ManageView } from '../../features/manage/ManageView.jsx';
import Login from '../../pages/Login.jsx';
import { BottomNavigation } from './BottomNavigation.jsx';
import { Toast } from '../ui/Toast';

export function AppLayout() {
  // On récupère l'utilisateur depuis le contexte global de l'application
  const { user, view, setView, toast, hideToast } = useApp();

  // Si l'utilisateur n'est pas connecté, on affiche la page de login
  if (!user) {
    return (
      <>
        <Login />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </>
    );
  }

  // Si l'utilisateur est connecté, on affiche le layout principal avec les différentes vues
  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {view === 'study' ? <StudyView /> : <ManageView />}
      </main>

      <BottomNavigation current={view} onChange={setView} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
