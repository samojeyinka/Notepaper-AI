
export const ThemeToggle = () => {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      className="fixed bottom-8 left-8 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-600 dark:text-slate-400 z-30 hover:text-purple-500 transition-colors"
      onClick={toggleDarkMode}
    >
      <span className="material-icons-round dark:hidden">dark_mode</span>
      <span className="material-icons-round hidden dark:block">light_mode</span>
    </button>
  );
};
