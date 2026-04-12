import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-canvas">
      <div className="crextio-container">
        <Sidebar />
        <div className="main-wrapper">
          <TopNav />
          <div className="content-area">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
