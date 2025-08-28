// src/components/admin/BenefitsEditor.tsx
import { Benefit } from '@/types/page';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

interface BenefitsEditorProps {
  benefits: Benefit[];
  onChange: (benefits: Benefit[]) => void;
}

export const BenefitsEditor: React.FC<BenefitsEditorProps> = ({
  benefits,
  onChange,
}) => {
  const handleBenefitChange = (
    index: number,
    field: keyof Benefit,
    value: string
  ) => {
    const newBenefits = [...benefits];
    newBenefits[index] = {
      ...newBenefits[index],
      [field]: value,
    };
    onChange(newBenefits);
  };

  const addBenefit = () => {
    onChange([
      ...benefits,
      {
        title: 'Nowa korzyść', // domyślna wartość
        titleEn: 'New benefit', // domyślna wartość
        description: 'Opis', // domyślna wartość
        descriptionEn: 'Description', // domyślna wartość
        icon: 'Clock',
      },
    ]);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    onChange(newBenefits);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={addBenefit} variant="outline" size="sm">
          Dodaj korzyść
        </Button>
      </div>

      {benefits.map((benefit, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Korzyść {index + 1}</span>
            <Button
              onClick={() => removeBenefit(index)}
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
              value={benefit.title}
              onChange={(e) =>
                handleBenefitChange(index, 'title', e.target.value)
              }
            />
            <Input
              label="Tytuł EN"
              value={benefit.titleEn}
              onChange={(e) =>
                handleBenefitChange(index, 'titleEn', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opis PL"
              value={benefit.description}
              onChange={(e) =>
                handleBenefitChange(index, 'description', e.target.value)
              }
            />
            <Input
              label="Opis EN"
              value={benefit.descriptionEn}
              onChange={(e) =>
                handleBenefitChange(index, 'descriptionEn', e.target.value)
              }
            />
          </div>

          <div>
            <Input
              label="Ikona"
              value={benefit.icon}
              onChange={(e) =>
                handleBenefitChange(index, 'icon', e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
