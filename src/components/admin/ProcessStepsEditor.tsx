// src/components/admin/ProcessStepsEditor.tsx
import { ProcessStep } from '@/types/page';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

interface ProcessStepsEditorProps {
  steps: ProcessStep[];
  onChange: (steps: ProcessStep[]) => void;
}

export const ProcessStepsEditor: React.FC<ProcessStepsEditorProps> = ({
  steps,
  onChange,
}) => {
  const handleStepChange = (
    index: number,
    field: keyof ProcessStep,
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
        <h3 className="text-lg font-semibold">Kroki procesu</h3>
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
        </div>
      ))}
    </div>
  );
};
