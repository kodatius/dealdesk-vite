
import { Routes, Route, Navigate } from 'react-router-dom';
import DealDeskDashboard from './dealdesk/pages/DealDeskDashboard';
import DealsList from './dealdesk/pages/DealsList';
import DealDetail from './dealdesk/pages/DealDetail';
import DealDeskSettings from './dealdesk/pages/DealDeskSettings';

function App() {
  return (
    <div className="font-sans antialiased selection:bg-nova-gold selection:text-nova-black">
      <Routes>
        <Route path="/" element={<Navigate to="/deals" replace />} />
        <Route path="/dashboard" element={<DealDeskDashboard />} />
        <Route path="/deals" element={<DealsList />} />
        <Route path="/deals/new" element={<DealDetail isNew />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/settings" element={<DealDeskSettings />} />
      </Routes>
    </div>
  );
}

export default App;
