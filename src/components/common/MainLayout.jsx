import React from 'react';
import DashboardSidebar from './DashboardSidebar'; // adjust path as needed
import Header from './Header';

const MainLayout = ({ children, user, repoId }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar user={user} repoId={repoId} />
      <main className="flex-grow overflow-y-auto bg-[#1B2027]">
        <Header user={user} />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
