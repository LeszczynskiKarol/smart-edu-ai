// src/app/[locale]/[workType]/[subject]/[specialization]/page.tsx

type PageParams = {
  params: {
    locale: string;
    workType: string;
    subject: string;
    specialization: string;
  };
};

export default async function SpecializationPage({
  params: { locale, workType, subject, specialization },
}: PageParams) {
  const page = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${workType}/${subject}/${specialization}`
  );
  const data = await page.json();
  return <div>{/* twój komponent */}</div>;
}
