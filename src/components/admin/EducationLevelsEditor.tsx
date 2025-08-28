// src/components/admin/EducationLevelsEditor.tsx
import { EducationLevel } from '@/types/page';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

interface EducationLevelsEditorProps {
  levels: EducationLevel[];
  onChange: (levels: EducationLevel[]) => void;
}

export const EducationLevelsEditor: React.FC<EducationLevelsEditorProps> = ({
  levels,
  onChange,
}) => {
  const handleLevelChange = (
    index: number,
    field: keyof EducationLevel,
    value: string
  ) => {
    const newLevels = [...levels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: value,
    };
    onChange(newLevels);
  };

  const addLevel = () => {
    onChange([
      ...levels,
      {
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        icon: 'GraduationCap',
      },
    ]);
  };

  const removeLevel = (index: number) => {
    const newLevels = levels.filter((_, i) => i !== index);
    onChange(newLevels);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Poziomy edukacji</h3>
        <Button onClick={addLevel} variant="outline" size="sm">
          Dodaj poziom
        </Button>
      </div>

      {levels.map((level, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Poziom {index + 1}</span>
            <Button
              onClick={() => removeLevel(index)}
              variant="ghost"
              size="sm"
              className="text-red-500"
            >
              Usuń
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tytuł PL"
              value={level.title}
              onChange={(e) =>
                handleLevelChange(index, 'title', e.target.value)
              }
            />
            <Input
              label="Tytuł EN"
              value={level.titleEn}
              onChange={(e) =>
                handleLevelChange(index, 'titleEn', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opis PL"
              value={level.description}
              onChange={(e) =>
                handleLevelChange(index, 'description', e.target.value)
              }
            />
            <Input
              label="Opis EN"
              value={level.descriptionEn}
              onChange={(e) =>
                handleLevelChange(index, 'descriptionEn', e.target.value)
              }
            />
          </div>

          <div>
            <Input
              label="Ikona"
              value={level.icon}
              onChange={(e) => handleLevelChange(index, 'icon', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
