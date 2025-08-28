// src/services/examples.ts
import { WorkType, Subject, Example, ExampleMeta } from '@/types/example';

export async function getSubjectsByLevel(level: string): Promise<Subject[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/examples/subjects?level=${level}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch subjects');
  }
  return response.json();
}

export async function getExampleBySlug(
  locale: string,
  level: string,
  workType: string,
  subject: string,
  slug: string
): Promise<Example> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/examples/${locale}/${level}/${workType}/${subject}/${slug}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.text();
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(
      `Failed to fetch example: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data;
}

export async function getExamplesBySubject(
  locale: string,
  level: string,
  subject: string
): Promise<ExampleMeta[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/examples/${locale}/${level}/${subject}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to fetch examples');
  }

  const data = await response.json();

  return data.map((example: any) => ({
    ...example,
    createdAt: new Date(example.createdAt),
    updatedAt: new Date(example.updatedAt),
  }));
}

// src/services/examples.ts
export async function getExamplesByWorkType(
  locale: string,
  level: string,
  workType: string
): Promise<ExampleMeta[]> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/examples/${locale}/${level}/${workType}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from examples API:', errorText);
      return [];
    }

    const data = await response.json();

    return data.map((example: any) => ({
      ...example,
      createdAt: new Date(example.createdAt),
      updatedAt: new Date(example.updatedAt),
    }));
  } catch (error) {
    console.error('Error fetching examples:', error);
    return [];
  }
}

export async function getExamplesByLevel(
  locale: string,
  level: string
): Promise<ExampleMeta[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/examples/${locale}/${level}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to fetch examples');
  }

  const data = await response.json();

  return data.map((example: any) => ({
    ...example,
    createdAt: new Date(example.createdAt),
    updatedAt: new Date(example.updatedAt),
  }));
}

export async function getAllWorkTypes(): Promise<WorkType[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/work-types`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch work types');
  }
  return response.json();
}

export async function getAllSubjects(): Promise<Subject[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/subjects`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch subjects');
  }
  return response.json();
}

export async function getAllExamples(): Promise<ExampleMeta[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/examples`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to fetch examples');
  }

  const data = await response.json();

  return data.map((example: any) => ({
    ...example,
    createdAt: new Date(example.createdAt),
    updatedAt: new Date(example.updatedAt),
  }));
}

export async function getRelatedExamples(
  example: Example,
  limit: number = 3
): Promise<Example[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/examples/related?exampleId=${example._id}&level=${example.level}&workType=${example.workType.slugEn}&subject=${example.subject.slugEn}&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch related examples');
  }

  return response.json();
}
