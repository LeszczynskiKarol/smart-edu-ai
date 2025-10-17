// src/app/[locale]/admin/dashboard/pages/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Editor from '@/components/Editor';
import {
  HowItWorksStep,
  EducationLevel,
  PricingPlan,
  Service,
  ProcessStep,
  Benefit,
} from '@/types/page';
import { useAuth } from '@/context/AuthContext';
import { BenefitsEditor } from '@/components/admin/BenefitsEditor';
import { ProcessStepsEditor } from '@/components/admin/ProcessStepsEditor';
import { ServicesEditor } from '@/components/admin/ServicesEditor';
import { HowItWorksEditor } from '@/components/admin/HowItWorksEditor';
import { EducationLevelsEditor } from '@/components/admin/EducationLevelsEditor';
import { PricingPlansEditor } from '@/components/admin/PricingPlansEditor';

type SelectOption = {
  label: string;
  value: string;
  valueEn: string;
};

type FormData = {
  workType: string;
  category?: string;
  subcategory?: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  metaTitle: string;
  metaTitleEn: string;
  metaDescription: string;
  metaDescriptionEn: string;
  // Hero section
  heroTitle: string;
  heroTitleEn: string;
  heroSubtitle: string;
  heroSubtitleEn: string;
  heroCta: string;
  heroCtaEn: string;
  heroFeatures: Array<{
    icon: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
  }>;
  heroImage?: string; // URL zdjęcia
  heroImageFile?: File; // Tymczasowe pole na plik przed uploadem
  // Benefits section
  benefits: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  }>;

  // Process section
  processSteps: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
  }>;
  // Tytuły sekcji
  benefitsSectionTitle: string;
  benefitsSectionTitleEn: string;
  processSectionTitle: string;
  processSectionTitleEn: string;

  // Sekcja Video
  videoUrl?: string;
  videoTitle: string;
  videoTitleEn: string;
  videoDescription: string;
  videoDescriptionEn: string;

  // Sekcja Services
  services: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
    price?: string;
  }>;
  servicesSectionTitle: string;
  servicesSectionTitleEn: string;

  // Sekcja How It Works
  howItWorksSteps: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  }>;
  howItWorksSectionTitle: string;
  howItWorksSectionTitleEn: string;

  // Sekcja Education Levels
  educationLevels: Array<{
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  }>;
  educationLevelsSectionTitle: string;
  educationLevelsSectionTitleEn: string;

  // Sekcja Pricing
  pricingPlans: Array<{
    name: string;
    nameEn: string;
    price: string;
    features: string[];
    featuresEn: string[];
    isPopular?: boolean;
  }>;
  pricingSectionTitle: string;
  pricingSectionTitleEn: string;
  sectionsVisibility: {
    hero: boolean;
    benefits: boolean;
    process: boolean;
    video: boolean;
    services: boolean;
    howItWorks: boolean;
    educationLevels: boolean;
    pricing: boolean;
  };
};

export default function EditPage({ params }: { params: { id: string } }) {
  console.log('Otrzymane params:', params);

  const [workTypes, setWorkTypes] = useState<SelectOption[]>([]);
  const router = useRouter();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    workType: '',
    title: '',
    titleEn: '',
    content: 'Treść domyślna',
    contentEn: 'Default content',
    metaTitle: '',
    metaTitleEn: '',
    metaDescription: '',
    metaDescriptionEn: '',

    // Hero section
    heroTitle: '',
    heroTitleEn: '',
    heroSubtitle: '',
    heroSubtitleEn: '',
    heroCta: '',
    heroCtaEn: '',
    heroFeatures: [],

    // Sekcja Benefits
    benefits: [],
    benefitsSectionTitle: '',
    benefitsSectionTitleEn: '',

    // Sekcja Process
    processSteps: [],
    processSectionTitle: '',
    processSectionTitleEn: '',

    // Sekcja Video
    videoUrl: '',
    videoTitle: '',
    videoTitleEn: '',
    videoDescription: '',
    videoDescriptionEn: '',

    // Sekcja Services
    services: [],
    servicesSectionTitle: '',
    servicesSectionTitleEn: '',

    // Sekcja How It Works
    howItWorksSteps: [],
    howItWorksSectionTitle: '',
    howItWorksSectionTitleEn: '',

    // Sekcja Education Levels
    educationLevels: [],
    educationLevelsSectionTitle: '',
    educationLevelsSectionTitleEn: '',

    // Sekcja Pricing
    pricingPlans: [],
    pricingSectionTitle: '',
    pricingSectionTitleEn: '',
    sectionsVisibility: {
      hero: true,
      benefits: true,
      process: true,
      video: true,
      services: true,
      howItWorks: true,
      educationLevels: true,
      pricing: true,
    },
  });

  useEffect(() => {
    const fetchWorkTypes = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error('Brak tokenu autoryzacji');

        console.log('Pobieranie typów prac...');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Błąd pobierania typów prac');

        const data = await response.json();
        console.log('Otrzymane dane z API:', data);

        setWorkTypes(data); // teraz możemy użyć danych bezpośrednio
        console.log('Ustawione workTypes:', data);
      } catch (error) {
        console.error('Błąd:', error);
      }
    };

    fetchWorkTypes();
  }, []);

  useEffect(() => {
    console.log('Otrzymane params:', params);

    if (!params.id || params.id === 'undefined') {
      console.log('Brak prawidłowego ID, przekierowuję...');
      router.push('/admin/dashboard/pages');
      return;
    }

    const fetchPage = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error('Brak tokenu autoryzacji');

        console.log('Pobieranie strony z ID:', params.id);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/details/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych strony');
        }

        const pageData = await response.json();
        console.log('Pobrane dane:', pageData);
        setFormData(pageData);
      } catch (error) {
        console.error('Błąd podczas pobierania danych strony:', error);
        alert('Nie udało się pobrać danych strony');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [params.id]);

  const handleEditorChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHowItWorksStepsChange = (newSteps: HowItWorksStep[]) => {
    setFormData((prev) => ({
      ...prev,
      howItWorksSteps: newSteps,
    }));
  };

  const handleEducationLevelsChange = (newLevels: EducationLevel[]) => {
    setFormData((prev) => ({
      ...prev,
      educationLevels: newLevels,
    }));
  };

  const handlePricingPlansChange = (newPlans: PricingPlan[]) => {
    setFormData((prev) => ({
      ...prev,
      pricingPlans: newPlans,
    }));
  };

  const handleBenefitsChange = (newBenefits: Benefit[]) => {
    setFormData((prev) => ({
      ...prev,
      benefits: newBenefits,
    }));
  };

  const handleProcessStepsChange = (newSteps: ProcessStep[]) => {
    setFormData((prev) => ({
      ...prev,
      processSteps: newSteps,
    }));
  };

  const handleServicesChange = (newServices: Service[]) => {
    setFormData((prev) => ({
      ...prev,
      services: newServices,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const workTypeObj = workTypes.find(
        (wt) => wt.value === formData.workType
      );

      console.log('FormData przed wysłaniem:', formData);
      console.log(
        'sectionsVisibility przed wysłaniem:',
        formData.sectionsVisibility
      );

      const dataToSend = {
        ...formData,
        workType: workTypeObj?.valueEn,
      };

      console.log('Dane do wysłania:', dataToSend);

      const token = getToken();
      if (!token) throw new Error('Brak tokenu autoryzacji');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${params.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const responseData = await response.json();
      console.log('Odpowiedź z serwera:', responseData);

      if (!response.ok) {
        throw new Error(
          `Błąd podczas aktualizacji strony: ${responseData.message}`
        );
      }

      // Po udanym zapisie odświeżamy stronę
      window.location.reload();
    } catch (error) {
      console.error('Błąd:', error);
      alert('Nie udało się zaktualizować strony: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  const HeroFeaturesEditor: React.FC<{
    features: FormData['heroFeatures'];
    onChange: (features: FormData['heroFeatures']) => void;
  }> = ({ features, onChange }) => {
    const handleAdd = () => {
      onChange([
        ...features,
        {
          icon: 'BookOpen',
          title: '',
          titleEn: '',
          description: '',
          descriptionEn: '',
        },
      ]);
    };

    const handleChange = (index: number, field: string, value: string) => {
      const newFeatures = [...features];
      newFeatures[index] = {
        ...newFeatures[index],
        [field]: value,
      };
      onChange(newFeatures);
    };

    return (
      <div className="space-y-4">
        <Label>Features Hero</Label>
        {features.map((feature, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded"
          >
            <div>
              <Label>Ikona</Label>
              <Select
                value={feature.icon}
                onChange={(e) => handleChange(index, 'icon', e.target.value)}
                options={[
                  { value: 'BookOpen', label: 'Książka' },
                  { value: 'Brain', label: 'Mózg' },
                  { value: 'Clock', label: 'Zegar' },
                  { value: 'Sparkles', label: 'Iskry' },
                ]}
              />
            </div>
            <div>
              <Label>Tytuł PL</Label>
              <Input
                value={feature.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Tytuł EN</Label>
              <Input
                value={feature.titleEn}
                onChange={(e) => handleChange(index, 'titleEn', e.target.value)}
              />
            </div>
            <div>
              <Label>Opis PL</Label>
              <Input
                value={feature.description}
                onChange={(e) =>
                  handleChange(index, 'description', e.target.value)
                }
              />
            </div>
            <div>
              <Label>Opis EN</Label>
              <Input
                value={feature.descriptionEn}
                onChange={(e) =>
                  handleChange(index, 'descriptionEn', e.target.value)
                }
              />
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                const newFeatures = features.filter((_, i) => i !== index);
                onChange(newFeatures);
              }}
            >
              Usuń
            </Button>
          </div>
        ))}
        <Button onClick={handleAdd}>Dodaj Feature</Button>
      </div>
    );
  };

  return (
    <Layout title="Edycja strony">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mt-20">
        <div>
          <Label htmlFor="workType">Typ pracy</Label>
          <Select
            id="workType"
            name="workType"
            value={formData.workType}
            onChange={handleChange}
            options={workTypes}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Kategoria (opcjonalnie)</Label>
          <Input
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            placeholder="np. ekonomia"
          />
        </div>

        <div>
          <Label htmlFor="subcategory">Podkategoria (opcjonalnie)</Label>
          <Input
            id="subcategory"
            name="subcategory"
            value={formData.subcategory || ''}
            onChange={handleChange}
            placeholder="np. mikroekonomia"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="metaTitle">Meta tytuł PL</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              required={true}
            />
          </div>
          <div>
            <Label htmlFor="metaTitleEn">Meta tytuł EN</Label>
            <Input
              id="metaTitleEn"
              name="metaTitleEn"
              value={formData.metaTitleEn}
              onChange={handleChange}
              required={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="metaDescription">Meta opis PL</Label>
            <Input
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              required={true}
            />
          </div>
          <div>
            <Label htmlFor="metaDescriptionEn">Meta opis EN</Label>
            <Input
              id="metaDescriptionEn"
              name="metaDescriptionEn"
              value={formData.metaDescriptionEn}
              onChange={handleChange}
              required={true}
            />
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Widoczność sekcji</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hero-visibility"
                checked={formData.sectionsVisibility.hero}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      hero: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="hero-visibility">Sekcja Hero</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="benefits-visibility"
                checked={formData.sectionsVisibility.benefits}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      benefits: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="benefits-visibility">Sekcja Korzyści</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="process-visibility"
                checked={formData.sectionsVisibility.process}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      process: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="process-visibility">Sekcja Proces</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="video-visibility"
                checked={formData.sectionsVisibility.video}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      video: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="video-visibility">Sekcja Video</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="services-visibility"
                checked={formData.sectionsVisibility.services}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      services: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="services-visibility">Sekcja Usługi</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="how-it-works-visibility"
                checked={formData.sectionsVisibility.howItWorks}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      howItWorks: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="how-it-works-visibility">
                Sekcja Jak to działa
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="education-levels-visibility"
                checked={formData.sectionsVisibility.educationLevels}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      educationLevels: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="education-levels-visibility">
                Sekcja Poziomy edukacji
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pricing-visibility"
                checked={formData.sectionsVisibility.pricing}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      pricing: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="pricing-visibility">Sekcja Cennik</Label>
            </div>
          </div>
        </div>
        {/*<div>
            <Label>Treść po polsku</Label>
            <Editor
              value={formData.content}
              onChange={handleEditorChange('content')}
              placeholder="Treść strony po polsku..."
              error={!formData.content ? 'To pole jest wymagane' : undefined}
            />
          </div>

          <div>
            <Label>Treść po angielsku</Label>
            <Editor
              value={formData.contentEn}
              onChange={handleEditorChange('contentEn')}
              placeholder="Treść strony po angielsku..."
              error={!formData.contentEn ? 'To pole jest wymagane' : undefined}
            />
          </div>*/}

        {/* Sekcja Hero */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja HERO</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="hero-visibility"
                checked={formData.sectionsVisibility.hero}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      hero: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="hero-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.hero && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="heroTitle">Tytuł Hero PL</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.hero}
                  />
                </div>
                <div>
                  <Label htmlFor="heroTitleEn">Tytuł Hero EN</Label>
                  <Input
                    id="heroTitleEn"
                    name="heroTitleEn"
                    value={formData.heroTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.hero}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="heroSubtitle">Podtytuł Hero PL</Label>
                  <Input
                    id="heroSubtitle"
                    name="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.hero}
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitleEn">Podtytuł Hero EN</Label>
                  <Input
                    id="heroSubtitleEn"
                    name="heroSubtitleEn"
                    value={formData.heroSubtitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.hero}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="heroCta">CTA Hero PL</Label>
                  <Input
                    id="heroCta"
                    name="heroCta"
                    value={formData.heroCta}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.hero}
                  />
                </div>
                <div>
                  <Label htmlFor="heroCtaEn">CTA Hero EN</Label>
                  <Input
                    id="heroCtaEn"
                    name="heroCtaEn"
                    value={formData.heroCtaEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.hero}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="heroImage">Zdjęcie w sekcji Hero</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    id="heroImage"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('image', file);

                        const token = getToken();
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/upload`,
                          {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                          }
                        );

                        if (response.ok) {
                          const { url } = await response.json();
                          setFormData((prev) => ({
                            ...prev,
                            heroImage: url,
                          }));
                        }
                      }
                    }}
                  />
                  {formData.heroImage && (
                    <img
                      src={formData.heroImage}
                      alt="Hero preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              <div className="border-t pt-4">
                <HeroFeaturesEditor
                  features={formData.heroFeatures}
                  onChange={(features) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroFeatures: features,
                    }))
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja Benefits */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja KORZYŚCI</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="benefits-visibility"
                checked={formData.sectionsVisibility.benefits}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      benefits: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="benefits-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.benefits && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="benefitsSectionTitle">
                    Tytuł sekcji korzyści PL
                  </Label>
                  <Input
                    id="benefitsSectionTitle"
                    name="benefitsSectionTitle"
                    value={formData.benefitsSectionTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.benefits}
                  />
                </div>
                <div>
                  <Label htmlFor="benefitsSectionTitleEn">
                    Tytuł sekcji korzyści EN
                  </Label>
                  <Input
                    id="benefitsSectionTitleEn"
                    name="benefitsSectionTitleEn"
                    value={formData.benefitsSectionTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.benefits}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <BenefitsEditor
                  benefits={formData.benefits}
                  onChange={handleBenefitsChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja Video */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja VIDEO</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="video-visibility"
                checked={formData.sectionsVisibility.video}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      video: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="video-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.video && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="videoTitle">Tytuł sekcji video PL</Label>
                  <Input
                    id="videoTitle"
                    name="videoTitle"
                    value={formData.videoTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.video}
                  />
                </div>
                <div>
                  <Label htmlFor="videoTitleEn">Tytuł sekcji video EN</Label>
                  <Input
                    id="videoTitleEn"
                    name="videoTitleEn"
                    value={formData.videoTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.video}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="videoDescription">Opis video PL</Label>
                  <Input
                    id="videoDescription"
                    name="videoDescription"
                    value={formData.videoDescription}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.video}
                  />
                </div>
                <div>
                  <Label htmlFor="videoDescriptionEn">Opis video EN</Label>
                  <Input
                    id="videoDescriptionEn"
                    name="videoDescriptionEn"
                    value={formData.videoDescriptionEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.video}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="videoUrl">URL Video</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja Services */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja USŁUGI</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="services-visibility"
                checked={formData.sectionsVisibility.services}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      services: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="services-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.services && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="servicesSectionTitle">Smart-Edu.ai</Label>
                  <Input
                    id="servicesSectionTitle"
                    name="servicesSectionTitle"
                    value={formData.servicesSectionTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.services}
                  />
                </div>
                <div>
                  <Label htmlFor="servicesSectionTitleEn">
                    Tytuł sekcji usług EN
                  </Label>
                  <Input
                    id="servicesSectionTitleEn"
                    name="servicesSectionTitleEn"
                    value={formData.servicesSectionTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.services}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <ServicesEditor
                  services={formData.services}
                  onChange={handleServicesChange}
                />
              </div>
            </div>
          )}
        </div>
        {/* Sekcja Process */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja PROCES</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="process-visibility"
                checked={formData.sectionsVisibility.process}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      process: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="process-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.process && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="processSectionTitle">
                    Tytuł sekcji procesu PL
                  </Label>
                  <Input
                    id="processSectionTitle"
                    name="processSectionTitle"
                    value={formData.processSectionTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.process}
                  />
                </div>
                <div>
                  <Label htmlFor="processSectionTitleEn">
                    Tytuł sekcji procesu EN
                  </Label>
                  <Input
                    id="processSectionTitleEn"
                    name="processSectionTitleEn"
                    value={formData.processSectionTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.process}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <ProcessStepsEditor
                  steps={formData.processSteps}
                  onChange={handleProcessStepsChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja How It Works */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja JAK TO DZIAŁA</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="how-it-works-visibility"
                checked={formData.sectionsVisibility.howItWorks}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      howItWorks: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="how-it-works-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.howItWorks && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="howItWorksSectionTitle">
                    Tytuł sekcji Jak to działa PL
                  </Label>
                  <Input
                    id="howItWorksSectionTitle"
                    name="howItWorksSectionTitle"
                    value={formData.howItWorksSectionTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.howItWorks}
                  />
                </div>
                <div>
                  <Label htmlFor="howItWorksSectionTitleEn">
                    Tytuł sekcji Jak to działa EN
                  </Label>
                  <Input
                    id="howItWorksSectionTitleEn"
                    name="howItWorksSectionTitleEn"
                    value={formData.howItWorksSectionTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.howItWorks}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <HowItWorksEditor
                  steps={formData.howItWorksSteps}
                  onChange={handleHowItWorksStepsChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja Education Levels */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja POZIOMY EDUKACJI</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="education-levels-visibility"
                checked={formData.sectionsVisibility.educationLevels}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      educationLevels: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="education-levels-visibility">
                Widoczność sekcji
              </Label>
            </div>
          </div>

          {formData.sectionsVisibility.educationLevels && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="educationLevelsSectionTitle">
                    Tytuł sekcji poziomów edukacji PL
                  </Label>
                  <Input
                    id="educationLevelsSectionTitle"
                    name="educationLevelsSectionTitle"
                    value={formData.educationLevelsSectionTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.educationLevels}
                  />
                </div>
                <div>
                  <Label htmlFor="educationLevelsSectionTitleEn">
                    Tytuł sekcji poziomów edukacji EN
                  </Label>
                  <Input
                    id="educationLevelsSectionTitleEn"
                    name="educationLevelsSectionTitleEn"
                    value={formData.educationLevelsSectionTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.educationLevels}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <EducationLevelsEditor
                  levels={formData.educationLevels}
                  onChange={handleEducationLevelsChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sekcja Pricing */}
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Sekcja CENNIK</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="pricing-visibility"
                checked={formData.sectionsVisibility.pricing}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionsVisibility: {
                      ...prev.sectionsVisibility,
                      pricing: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="pricing-visibility">Widoczność sekcji</Label>
            </div>
          </div>

          {formData.sectionsVisibility.pricing && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pricingSectionTitle">
                    Tytuł sekcji cennika PL
                  </Label>
                  <Input
                    id="pricingSectionTitle"
                    name="pricingSectionTitle"
                    value={formData.pricingSectionTitle}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.pricing}
                  />
                </div>
                <div>
                  <Label htmlFor="pricingSectionTitleEn">
                    Tytuł sekcji cennika EN
                  </Label>
                  <Input
                    id="pricingSectionTitleEn"
                    name="pricingSectionTitleEn"
                    value={formData.pricingSectionTitleEn}
                    onChange={handleChange}
                    required={formData.sectionsVisibility.pricing}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <PricingPlansEditor
                  plans={formData.pricingPlans}
                  onChange={handlePricingPlansChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Anuluj
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </form>
    </Layout>
  );
}
