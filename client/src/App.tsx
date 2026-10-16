import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './translations/index.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal.js';
import { ShareTargetBanner } from './components/ShareTargetBanner.js';
import { LocalScannerView } from './components/LocalScannerView.js';
import { Dashboard } from './pages/Dashboard.js';
import { SourcesManager } from './pages/SourcesManager.js';
import { SimulatorStudio } from './pages/SimulatorStudio.js';
import { SafetyGuide } from './pages/SafetyGuide.js';
import { AwarenessQuiz } from './pages/AwarenessQuiz.js';
import { PrivacyHistory } from './pages/PrivacyHistory.js';

export const AppContent: React.FC = () => {
  // Default to scanner tab for immediate local scanning & judge testing
  const [currentTab, setCurrentTab] = useState<string>('scanner');
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);

  // Android Web Share Target Query State
  const [sharedText, setSharedText] = useState<string | undefined>(undefined);
  const [sharedUrl, setSharedUrl] = useState<string | undefined>(undefined);
  const [activeSharedInput, setActiveSharedInput] = useState<string>('');

  useEffect(() => {
    // Parse Android Web Share Target GET query parameters
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get('text') || params.get('title') || params.get('shared_text');
    const urlParam = params.get('url') || params.get('shared_url');

    if (textParam || urlParam) {
      const decodedText = textParam ? decodeURIComponent(textParam) : undefined;
      const decodedUrl = urlParam ? decodeURIComponent(urlParam) : undefined;
      setSharedText(decodedText);
      setSharedUrl(decodedUrl);

      // Clean browser address bar without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleScanSharedContent = (content: string, isUrl: boolean) => {
    setActiveSharedInput(content);
    setCurrentTab('scanner');
    setSharedText(undefined);
    setSharedUrl(undefined);
  };

  const handleDismissShared = () => {
    setSharedText(undefined);
    setSharedUrl(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-shield-darkest text-slate-100 font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenPrivacyNotice={() => setIsPrivacyNoticeOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Android Share Received Banner */}
        <ShareTargetBanner
          sharedText={sharedText}
          sharedUrl={sharedUrl}
          onScanNow={handleScanSharedContent}
          onDismiss={handleDismissShared}
        />

        {/* Tab Routing */}
        {currentTab === 'scanner' && (
          <LocalScannerView initialInput={activeSharedInput} />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenPrivacyNotice={() => setIsPrivacyNoticeOpen(true)}
          />
        )}

        {currentTab === 'sources' && (
          <SourcesManager />
        )}

        {currentTab === 'simulator' && (
          <SimulatorStudio />
        )}

        {currentTab === 'guide' && (
          <SafetyGuide />
        )}

        {currentTab === 'quiz' && (
          <AwarenessQuiz />
        )}

        {currentTab === 'privacy' && (
          <PrivacyHistory
            onOpenPrivacyNotice={() => setIsPrivacyNoticeOpen(true)}
          />
        )}
      </main>

      <Footer />

      {/* Privacy Notice Modal */}
      <PrivacyNoticeModal
        isOpen={isPrivacyNoticeOpen}
        onClose={() => setIsPrivacyNoticeOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};
export default App;
