import NavBar from '../components/NavBar';
import MotionControls from '../components/MotionControls';

export default function ControlsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar pagename="Controls" />
            <div className="flex flex-1 items-center justify-center">
                <MotionControls />
            </div>
        </div>
    );
}
