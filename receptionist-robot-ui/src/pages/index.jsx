import ChatBox from '../components/ChatBox';
import NavBar from '../components/NavBar';

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-50 flex flex-col overflow-hidden">
      <NavBar pagename="Receptionist Assistant" />
      <div className="flex-1 w-full">
        <ChatBox />
      </div>
    </div>
  );
}