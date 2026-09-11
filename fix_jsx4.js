const fs = require('fs');
let code = fs.readFileSync('src/app/relatorios/page.tsx', 'utf8');

code = code.replace(
  /\{activeTab === 'extratos' && extratos && \(\r?\n\s*<div className="bg-red-100 p-4 mb-4 rounded text-xs overflow-auto"><pre>\{JSON.stringify\(extratos, null, 2\)\}<\/pre><\/div>\r?\n\s*<div className="space-y-8 animate-in fade-in duration-300">/,
  `{activeTab === 'extratos' && extratos && (
          <div className="w-full">
            <div className="bg-red-100 p-4 mb-4 rounded text-xs overflow-auto"><pre>{JSON.stringify(extratos, null, 2)}</pre></div>
            <div className="space-y-8 animate-in fade-in duration-300">`
);

code = code.replace(
  /<\/div>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/main>/,
  `</div>\n            </div>\n          )}\n        </div>\n      </div>\n    </main>`
);

fs.writeFileSync('src/app/relatorios/page.tsx', code, 'utf8');
console.log('done wrap 4');
