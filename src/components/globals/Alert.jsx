import React from 'react';

export default function Alert({ type = 'info', message, details = [] }) {
  if (!message && (!details || details.length === 0)) return null;

  const baseClasses = "mb-2 md:mb-4 p-2 md:p-4 rounded-md md:rounded-xl text-[10px] md:text-sm border flex flex-col gap-2 relative overflow-hidden shadow-sm";
  
  let typeClasses = "";
  let icon = "";

  switch (type) {
    case 'error':
      typeClasses = "bg-red-50 text-red-700 border-red-200";
      icon = "error";
      break;
    case 'success':
      typeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      icon = "check_circle";
      break;
    case 'info':
    default:
      typeClasses = "bg-blue-50 text-blue-700 border-blue-200";
      icon = "info";
      break;
  }

  const hasDetails = Array.isArray(details) && details.length > 0;

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
       <div className="flex items-start gap-3 relative z-10">
         <span className="material-symbols-outlined shrink-0 mt-0.5">{icon}</span>
         <div className="flex-1">
            {message && <p className={`font-semibold ${hasDetails ? 'mb-2' : ''}`}>{message}</p>}
            {hasDetails && (
              <ul className="list-disc pl-5 space-y-1 opacity-90 text-[10px] md:text-xs">
                {details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
         </div>
       </div>
    </div>
  );
}
