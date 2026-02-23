import { AppProvider } from './contexts/AppContext.jsx';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
