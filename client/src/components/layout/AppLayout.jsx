import { useApp } from '../../contexts/AppContext.jsx';
import { StudyView } from '../../features/study/StudyView';
import { ManageView } from '../../features/manage/ManageView';
import { BottomNavigation } from './BottomNavigation';
import { Toast } from '../ui/Toast';

export function AppLayout() {
  const { view, setView, toast, hideToast } = useApp();

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
