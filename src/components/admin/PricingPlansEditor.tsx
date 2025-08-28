// src/components/admin/PricingPlansEditor.tsx
import { PricingPlan } from '@/types/page';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface PricingPlansEditorProps {
  plans: PricingPlan[];
  onChange: (plans: PricingPlan[]) => void;
}

export const PricingPlansEditor: React.FC<PricingPlansEditorProps> = ({
  plans,
  onChange,
}) => {
  const handlePlanChange = (
    index: number,
    field: keyof PricingPlan,
    value: any
  ) => {
    const newPlans = [...plans];
    newPlans[index] = {
      ...newPlans[index],
      [field]: value,
    };
    onChange(newPlans);
  };

  const handleFeaturesChange = (
    index: number,
    value: string,
    isEn: boolean = false
  ) => {
    const newPlans = [...plans];
    const features = value.split('\n').filter((f) => f.trim() !== '');
    newPlans[index] = {
      ...newPlans[index],
      [isEn ? 'featuresEn' : 'features']: features,
    };
    onChange(newPlans);
  };

  const addPlan = () => {
    onChange([
      ...plans,
      {
        name: '',
        nameEn: '',
        price: '',
        features: [],
        featuresEn: [],
        isPopular: false,
      },
    ]);
  };

  const removePlan = (index: number) => {
    const newPlans = plans.filter((_, i) => i !== index);
    onChange(newPlans);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pakiety cenowe</h3>
        <Button onClick={addPlan} variant="outline" size="sm">
          Dodaj pakiet
        </Button>
      </div>

      {plans.map((plan, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Pakiet {index + 1}</span>
            <Button
              onClick={() => removePlan(index)}
              variant="ghost"
              size="sm"
              className="text-red-500"
            >
              Usuń
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nazwa PL"
              value={plan.name}
              onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
            />
            <Input
              label="Nazwa EN"
              value={plan.nameEn}
              onChange={(e) =>
                handlePlanChange(index, 'nameEn', e.target.value)
              }
            />
          </div>

          <Input
            label="Cena"
            value={plan.price}
            onChange={(e) => handlePlanChange(index, 'price', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Funkcje PL (każda w nowej linii)"
              value={plan.features.join('\n')}
              onChange={(e) => handleFeaturesChange(index, e.target.value)}
            />
            <Textarea
              label="Funkcje EN (każda w nowej linii)"
              value={plan.featuresEn.join('\n')}
              onChange={(e) =>
                handleFeaturesChange(index, e.target.value, true)
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`isPopular-${index}`}
              checked={plan.isPopular || false}
              onCheckedChange={(checked) =>
                handlePlanChange(index, 'isPopular', checked)
              }
            />
            <label htmlFor={`isPopular-${index}`}>Pakiet popularny</label>
          </div>
        </div>
      ))}
    </div>
  );
};
