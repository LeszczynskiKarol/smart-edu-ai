// src/components/admin/ServicesEditor.tsx
import { Service } from '@/types/page';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

interface ServicesEditorProps {
  services: Service[];
  onChange: (services: Service[]) => void;
}

export const ServicesEditor: React.FC<ServicesEditorProps> = ({
  services,
  onChange,
}) => {
  const handleServiceChange = (
    index: number,
    field: keyof Service,
    value: string
  ) => {
    const newServices = [...services];
    newServices[index] = {
      ...newServices[index],
      [field]: value,
    };
    onChange(newServices);
  };

  const addService = () => {
    onChange([
      ...services,
      {
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        icon: 'Service',
        price: '',
      },
    ]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    onChange(newServices);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Usługi</h3>
        <Button onClick={addService} variant="outline" size="sm">
          Dodaj usługę
        </Button>
      </div>

      {services.map((service, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Usługa {index + 1}</span>
            <Button
              onClick={() => removeService(index)}
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
              value={service.title}
              onChange={(e) =>
                handleServiceChange(index, 'title', e.target.value)
              }
            />
            <Input
              label="Tytuł EN"
              value={service.titleEn}
              onChange={(e) =>
                handleServiceChange(index, 'titleEn', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opis PL"
              value={service.description}
              onChange={(e) =>
                handleServiceChange(index, 'description', e.target.value)
              }
            />
            <Input
              label="Opis EN"
              value={service.descriptionEn}
              onChange={(e) =>
                handleServiceChange(index, 'descriptionEn', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ikona"
              value={service.icon}
              onChange={(e) =>
                handleServiceChange(index, 'icon', e.target.value)
              }
            />
            <Input
              label="Cena"
              value={service.price || ''}
              onChange={(e) =>
                handleServiceChange(index, 'price', e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
