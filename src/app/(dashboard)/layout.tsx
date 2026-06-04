import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[220px]">
        {children}
      </div>
    </>
  );
}
