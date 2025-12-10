import React from 'react';
import { CharacterStats, StatName, GeneratedCharacter, StatGrade } from '../types';
import { gradeToValue, getGradeColorHex } from '../utils/diceUtils';
import { useLanguage, TranslationKeys } from '../contexts/LanguageContext';

interface HeptagonStatsProps {
  character: GeneratedCharacter;
}

const statOrder: StatName[] = ['Attack', 'Precision', 'Speed', 'Agility', 'Defense', 'Vitality', 'Mana'];

// Define reasonable maximums for each stat to normalize them for the chart
const maxStats: { [key in StatName]: number } = {
  Vitality: 60,
  Attack: 25,
  Defense: 25,
  Speed: 12,
  Precision: 25,
  Agility: 25,
  Mana: 10,
};

// Define average baseline stats for comparison (all B-Grade)
const averageStats: CharacterStats = {
  Vitality: 'B', Attack: 'B', Defense: 'B', Speed: 'B', Precision: 'B', Agility: 'B', Mana: 'B',
};

const gradeGlowIntensity: Record<StatGrade, string> = {
    'SS': '8px',
    'S': '6px',
    'A': '5px',
    'B': '4px',
    'C': '3px',
    'D': '2px',
    'E': '2px',
};


const HeptagonStats: React.FC<HeptagonStatsProps> = ({ character }) => {
  const { t } = useLanguage();
  const size = 250;
  const center = size / 2;
  const radius = size * 0.35; // Slightly larger radius for labels

  // FIX: The character prop already contains the final calculated stats.
  // Recalculating them here applied the trait modifications a second time.
  const finalStats = character.stats;
  const finalBonusStats = character.bonusStats;

  const statLabels: { [key: string]: TranslationKeys } = {
    Vitality: 'Vitality', Attack: 'Attack', Defense: 'Defense', Speed: 'Speed',
    Precision: 'Precision', Agility: 'Agility', Mana: 'Mana',
  };
  
  const getDisplayValue = (statKey: StatName) => {
      const grade = finalStats[statKey];
      const bonus = finalBonusStats[statKey] || 0;
      if (bonus === 0) return grade;
      if (bonus > 0) return t('statGradeBonus', { grade, bonus: String(bonus) });
      return t('statGradePenalty', { grade, bonus: String(bonus) });
  };


  const points = statOrder.map((statKey, i) => {
    const value = gradeToValue(finalStats[statKey], finalBonusStats[statKey] || 0, statKey);
    const maxValue = maxStats[statKey];
    const statRatio = Math.max(0, Math.min(1, value / maxValue));
    
    const angle = (Math.PI / 3.5) * i - Math.PI / 2; // Offset to have the first point at the top
    const x = center + radius * statRatio * Math.cos(angle);
    const y = center + radius * statRatio * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridLines = [0.25, 0.5, 0.75, 1].map((ratio, index) => {
    const gridPoints = statOrder.map((_, i) => {
      const angle = (Math.PI / 3.5) * i - Math.PI / 2;
      const x = center + radius * ratio * Math.cos(angle);
      const y = center + radius * ratio * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <polygon
        key={index}
        points={gridPoints}
        fill="none"
        stroke="rgba(71, 85, 105, 0.5)"
        strokeWidth="1"
      />
    );
  });
  
  // Calculate points for the average stats polygon
  const averagePoints = statOrder.map((statKey, i) => {
    const value = gradeToValue(averageStats[statKey]!, 0, statKey);
    const maxValue = maxStats[statKey];
    const statRatio = Math.max(0, Math.min(1, value / maxValue));
    
    const angle = (Math.PI / 3.5) * i - Math.PI / 2;
    const x = center + radius * statRatio * Math.cos(angle);
    const y = center + radius * statRatio * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const labels = statOrder.map((statKey, i) => {
    const angle = (Math.PI / 3.5) * i - Math.PI / 2;
    const labelRadius = radius * 1.3; // Adjusted label distance
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    
    const currentGrade = finalStats[statKey];
    const gradeColorFill = getGradeColorHex(currentGrade);
    const glowIntensity = gradeGlowIntensity[currentGrade];

    return (
        <g key={statKey}>
          <text
            x={x}
            y={y}
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.7))' }}
          >
            {t(statLabels[statKey])}
          </text>
          <text
             x={x}
             y={y + 14}
             fill={gradeColorFill}
             fontSize="11"
             fontWeight="bold"
             textAnchor="middle"
             dominantBaseline="middle"
             style={{ filter: `drop-shadow(0 0 ${glowIntensity} ${gradeColorFill})` }}
           >
             {getDisplayValue(statKey)}
           </text>
        </g>
    );
  });
  
  return (
    <div className="w-full flex justify-center items-center -mt-2 -mb-2">
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
            <g>
                {gridLines}
                {/* Average Stats Polygon */}
                <polygon
                    points={averagePoints}
                    fill="rgba(100, 116, 139, 0.2)"
                    stroke="rgba(100, 116, 139, 0.4)"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                />
                {labels}
                {/* Character Stats Polygon */}
                <polygon
                    points={points}
                    fill="rgba(129, 140, 248, 0.2)"
                    stroke="#a5b4fc"
                    strokeWidth="2"
                />
            </g>
        </svg>
    </div>
  );
};

export default HeptagonStats;
