import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const Loader = () => {
  return (
    <div className="whatsapp-loader">
      <div className="loader-content">
        <div className="loader-icon">💬</div>
        <h2>Chat App</h2>
        <div className="loader-bar">
          <div className="loader-bar-fill"></div>
        </div>
      </div>
      <div className="loader-footer">
        🔒 End-to-end encrypted
      </div>
    </div>
  );
};

export default Loader;