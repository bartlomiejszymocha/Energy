import React from 'react';

interface IconRendererProps {
  icon?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ 
  icon, 
  className = "text-base sm:text-lg flex-shrink-0",
  fallback = null 
}) => {
  if (!icon) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }

  // Sprawdź czy to SVG (zaczyna się od <svg)
  if (icon.trim().startsWith('<svg')) {
    // BEZPIECZNA SANITYZACJA SVG - usuń potencjalnie niebezpieczne elementy
    let cleanedSvg = icon
      .replace(/width="24" height="24" "fill="none"/g, 'width="24" height="24" fill="none"') // Napraw podwójne cudzysłowy
      .replace(/"fill="none"/g, ' fill="none"') // Napraw inne błędy cudzysłowów
      .replace(/fill="none"/g, 'fill="none"') // Upewnij się, że fill="none" jest poprawne
      .replace(/fill="none"/g, 'fill="none"') // Napraw wszystkie wystąpienia
      // SECURITY: Usuń potencjalnie niebezpieczne elementy
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Usuń wszystkie script tagi
      .replace(/on\w+="[^"]*"/gi, '') // Usuń wszystkie event handlery (onclick, onload, etc.)
      .replace(/javascript:/gi, '') // Usuń javascript: protokoły
      .replace(/data:/gi, '') // Usuń data: protokoły (może zawierać kod)
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Usuń iframe
      .replace(/<object[^>]*>.*?<\/object>/gi, '') // Usuń object
      .replace(/<embed[^>]*>/gi, '') // Usuń embed
      .replace(/<link[^>]*>/gi, '') // Usuń link
      .replace(/<meta[^>]*>/gi, ''); // Usuń meta
    
    // Dodaj style do SVG, żeby się dopasował do kontenera
    const styledSvg = cleanedSvg.replace(
      /<svg([^>]*)>/,
      '<svg$1 style="width: 100%; height: 100%; max-width: 1.5rem; max-height: 1.5rem; object-fit: contain;">'
    );
    
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: styledSvg }}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '1.5rem',
          height: '1.5rem'
        }}
        onError={(e) => {
          console.error('SVG rendering error:', e);
          // Fallback do emoji jeśli SVG się nie wyrenderuje
          const target = e.target as HTMLElement;
          target.innerHTML = '⚡';
        }}
      />
    );
  }

  // Sprawdź czy to URL do SVG (zaczyna się od http/https)
  if (icon.trim().startsWith('http')) {
    return (
      <span 
        className={className}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '1.5rem',
          height: '1.5rem',
        }}
      >
        <img 
          src={icon} 
          alt="Action icon"
          style={{ 
            width: '100%', 
            height: '100%', 
            maxWidth: '1.5rem', 
            maxHeight: '1.5rem',
            objectFit: 'contain'
          }}
          onError={(e) => {
            // Fallback do emoji jeśli obrazek się nie załaduje
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallbackSpan = document.createElement('span');
            fallbackSpan.className = className;
            fallbackSpan.textContent = '⚡';
            target.parentNode?.insertBefore(fallbackSpan, target);
          }}
        />
      </span>
    );
  }

  // Domyślnie traktuj jako emoji/text
  return <span className={className}>{icon}</span>;
};
