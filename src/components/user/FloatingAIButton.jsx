export const FloatingAIButton = () => {
  return (
    <button className="fixed bottom-8 right-8 w-14 h-14 bg-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30">
      <span className="material-icons-round text-2xl">auto_fix_high</span>
    </button>
  );
};