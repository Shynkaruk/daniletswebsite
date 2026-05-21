// src/contexts/NavigationGuard.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const NavigationGuardContext = createContext();

const GOLD_GRADIENT = "linear-gradient(107.27deg, #8B6134 -27.97%, #A8834E -12.13%, #F2D892 22.69%, #FFE79E 45.99%, #E1C07B 77.51%)";

export const NavigationGuardProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const confirmNavigation = useCallback((url) => {
    if (!isDirty) {
      window.location.href = url;
      return;
    }
    setPendingUrl(url);
    setShowModal(true);
  }, [isDirty]);

  const handleLeave = () => {
    setShowModal(false);
    if (pendingUrl) window.location.href = pendingUrl;
  };

  const handleStay = () => {
    setShowModal(false);
    setPendingUrl(null);
  };

  return (
    <NavigationGuardContext.Provider value={{
      confirmNavigation,
      showModal,
      setShowModal,
      handleLeave,
      handleStay,
      setIsDirty,
      isDirty
    }}>
      {children}

      {/* Кастомне модальне вікно */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div 
              className="px-8 py-6 text-white text-center text-2xl font-bold"
              style={{ background: GOLD_GRADIENT }}
            >
              Leave this page?
            </div>

            <div className="p-8 text-center">
              <p className="text-[#18181B] text-[17px] leading-relaxed">
                Are you sure you want to leave?<br />
                If yes, you'll lose your progress.
              </p>
            </div>

            <div className="flex border-t border-gray-200">
              <button
                onClick={handleStay}
                className="flex-1 py-5 text-[#18181B] font-semibold border-r border-gray-200 hover:bg-gray-50 transition"
              >
                Stay
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 py-5 text-red-600 font-semibold hover:bg-red-50 transition"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationGuardContext.Provider>
  );
};

export const useNavigationGuard = () => useContext(NavigationGuardContext);