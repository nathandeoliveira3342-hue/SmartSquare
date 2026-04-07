import React from 'react';

interface MainLayoutProps {
  header: React.ReactNode;
  hero: React.ReactNode;
  sidebar: React.ReactNode;
  preview: React.ReactNode;
  darkMode: boolean;
  children?: React.ReactNode;
}

export default function MainLayout({ header, hero, sidebar, preview, darkMode, children }: MainLayoutProps) {
  return (
    <div className={`min-h-screen font-sans transition-all duration-500 ${darkMode ? 'dark bg-galaxy-purple text-white' : 'bg-white text-gray-900'}`}>
      {/* Header Section */}
      <header className="py-2 px-4 shadow-md border-b transition-colors duration-500 bg-galaxy-purple text-white border-deep-purple">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {header}
        </div>
      </header>

      {/* Hero Section (Gradient Band) */}
      <section className="w-full">
        {hero}
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar (Controls) */}
          <aside className="lg:col-span-7 space-y-4">
            {sidebar}
          </aside>

          {/* Preview (Sticky on Desktop) */}
          <section className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 flex flex-col items-center">
              {preview}
            </div>
          </section>
        </div>
      </main>
      {children}
    </div>
  );
}
