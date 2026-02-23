import { AppProvider } from './contexts/AppContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
