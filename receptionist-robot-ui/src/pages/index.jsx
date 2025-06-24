import ChatBox from '../components/ChatBox';

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-50 flex flex-col overflow-hidden">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 mt-4 text-center">Receptionist Assistant</h1>
      <div className="flex-1 w-full">
        <ChatBox />
      </div>
    </div>
  );
}