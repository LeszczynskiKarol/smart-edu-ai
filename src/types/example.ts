// src/types/example.ts
export type EducationLevel = 'primary' | 'secondary' | 'university';

export type WorkType = {
  _id: string;
  id?: string;
  name: string;
  nameEn: string;
  slug: string;
  slugEn: string;
};

export type ExampleLength =
  | '2000'
  | '3000'
  | '4000'
  | '7000'
  | '10000'
  | '20000';

export type Subject = {
  _id: string;
  id?: string;
  name: string;
  slugEn: string;
  nameEn: string;
  slug: string;
  icon?: string;
};

export type Example = {
  _id: string;
  id?: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  level: EducationLevel;
  subject: Subject;
  slug: string;
  slugEn: string;
  workType: WorkType;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  views: number;
  length: ExampleLength;
  metaTitlePl: string;
  metaTitleEn: string;
  metaDescriptionPl: string;
  metaDescriptionEn: string;
};

export type ExampleMeta = {
  id: string;
  _id: string;
  title: string;
  titleEn: string;
  level: EducationLevel;
  subject: Subject;
  workType: WorkType;
  slug: string;
  slugEn: string;
  tags: string[];
  views: number;
  length: ExampleLength;
  createdAt: Date;
};
