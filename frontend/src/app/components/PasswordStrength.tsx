import { useMemo } from 'react';
import zxcvbn from 'zxcvbn';

interface Props { password: string; }

const LEVELS = [
  { label: 'Very weak', color: 'bg-red-400',    text: 'text-red-500'    },
  { label: 'Weak',      color: 'bg-orange-400',  text: 'text-orange-500' },
  { label: 'Fair',      color: 'bg-yellow-400',  text: 'text-yellow-600' },
  { label: 'Strong',    color: 'bg-green-400',   text: 'text-green-600'  },
  { label: 'Very strong',color:'bg-green-600',   text: 'text-green-700'  },
];

export function PasswordStrength({ password }: Props) {
  const result = useMemo(() => password ? zxcvbn(password) : null, [password]);
  if (!password) return null;

  const score = result?.score ?? 0;
  const level = LEVELS[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300
            ${i <= score ? level.color : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`font-poppins text-xs font-medium ${level.text}`}>{level.label}</span>
        {result?.feedback?.suggestions?.[0] && (
          <span className="font-poppins text-xs text-gray-400 truncate max-w-[200px]">
            {result.feedback.suggestions[0]}
          </span>
        )}
      </div>
    </div>
  );
}
