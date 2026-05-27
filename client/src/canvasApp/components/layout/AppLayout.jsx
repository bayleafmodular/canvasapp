function AppLayout({ children, left, right, top, bottom }) {
  return <div className="flex flex-col h-full w-full overflow-hidden bg-[#1a1b1e] text-[#d1d1d1] font-sans select-none">
      {
    /* Top Toolbar */
  }
      <div className="h-12 bg-[#25262b] border-b border-[#333] flex items-center px-4 shrink-0 z-20">
        {top}
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {
    /* Left Toolbar */
  }
        <div className="w-14 bg-[#25262b] border-r border-[#333] flex flex-col items-center py-4 shrink-0 z-10">
          {left}
        </div>
        
        {
    /* Center Canvas Area */
  }
        <div className="flex-1 relative bg-[#1a1b1e] overflow-hidden cursor-crosshair">
          {children}
        </div>
        
        {
    /* Right Sidebar */
  }
        <div className="w-64 bg-[#25262b] border-l border-[#333] flex flex-col shrink-0 z-10 text-xs">
          {right}
        </div>
      </div>
      
      {
    /* Bottom Status Bar */
  }
      <div className="h-8 bg-[#25262b] border-t border-[#333] flex items-center px-4 text-[10px] font-mono shrink-0 z-20">
        {bottom}
      </div>
    </div>;
}
export {
  AppLayout
};
