// src/components/admin/HowItWorksEditor.tsx
import { HowItWorksStep } from '@/types/page';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

interface HowItWorksEditorProps {
  steps: HowItWorksStep[];
  onChange: (steps: HowItWorksStep[]) => void;
}

export const HowItWorksEditor: React.FC<HowItWorksEditorProps> = ({
  steps,
  onChange,
}) => {
  const handleStepChange = (
    index: number,
    field: keyof HowItWorksStep,
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    onChange(newSteps);
  };

  const addStep = () => {
    onChange([
      ...steps,
      {
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        icon: 'Info',
      },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Jak to działa</h3>
        <Button onClick={addStep} variant="outline" size="sm">
          Dodaj krok
        </Button>
      </div>

      {steps.map((step, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Krok {index + 1}</span>
            <Button
              onClick={() => removeStep(index)}
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
              value={step.title}
              onChange={(e) => handleStepChange(index, 'title', e.target.value)}
            />
            <Input
              label="Tytuł EN"
              value={step.titleEn}
              onChange={(e) =>
                handleStepChange(index, 'titleEn', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opis PL"
              value={step.description}
              onChange={(e) =>
                handleStepChange(index, 'description', e.target.value)
              }
            />
            <Input
              label="Opis EN"
              value={step.descriptionEn}
              onChange={(e) =>
                handleStepChange(index, 'descriptionEn', e.target.value)
              }
            />
          </div>

          <div>
            <Input
              label="Ikona"
              value={step.icon}
              onChange={(e) => handleStepChange(index, 'icon', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
