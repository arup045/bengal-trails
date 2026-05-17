const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/components/SmartSearchBar.tsx', 'utf8');

// Check if button code already exists
if (c.includes('showButton')) {
  console.log('Already has button code');
  process.exit(0);
}

// Add showButton prop to interface
c = c.replace(
  "  className?: string;\n  dropdownAbove?: boolean;\n}",
  "  className?: string;\n  dropdownAbove?: boolean;\n  showButton?: boolean;\n}"
);

// Add showButton to destructuring
c = c.replace(
  "  dropdownAbove = false,\n}: SmartSearchBarProps)",
  "  dropdownAbove = false,\n  showButton = false,\n}: SmartSearchBarProps)"
);

// Wrap input + add button after it
c = c.replace(
  "  return (\n    <div ref={containerRef}",
  "  return (\n    <div ref={containerRef}"
);

// Add button next to input by wrapping the input div
c = c.replace(
  "      <div className={`relative ${sizeClasses.container}`}>",
  "      <div className=\"flex items-center gap-2\">\n        <div className={`relative flex-1 ${sizeClasses.container}`}>"
);

// Close the inner div and add Search button before closing outer div
c = c.replace(
  "      </div>\n\n      <AnimatePresence>",
  "        </div>\n        {showButton && (\n          <button onClick={() => { if (query.trim()) { window.location.hash = '/explore?q=' + encodeURIComponent(query.trim()); setIsOpen(false); } }}\n            className=\"shrink-0 h-14 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full flex items-center gap-2 transition-all shadow-md text-base\">\n            <Search className=\"w-5 h-5\" />\n            <span>Search</span>\n          </button>\n        )}\n      </div>\n\n      <AnimatePresence>"
);

fs.writeFileSync('frontend/src/app/components/SmartSearchBar.tsx', c);
console.log('Done - button added');
