import NavBar from '../components/NavBar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <h2 className="text-3xl font-bold text-center mt-8 mb-4">Settings</h2>
      <div className="flex flex-col items-center mt-8">
        <p className="text-lg text-gray-600">Settings page coming soon...</p>
      </div>
    </div>
  );
}
