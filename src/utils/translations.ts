// src/utils/translations.ts
export const translateContentType = (contentType: string, t: any) => {
  // Sprawdź czy mamy tłumaczenie w dashboard.contentTypes
  const dashboardTranslation = t?.dashboard?.contentTypes?.[contentType];
  if (dashboardTranslation) return dashboardTranslation;

  // Sprawdź czy mamy tłumaczenie w orderStatus.contentTypes
  const orderStatusTranslation = t?.orderStatus?.contentTypes?.[contentType];
  if (orderStatusTranslation) return orderStatusTranslation;

  // Sprawdź czy mamy tłumaczenie w orderSuccess.contentTypes
  const orderSuccessTranslation = t?.orderSuccess?.contentTypes?.[contentType];
  if (orderSuccessTranslation) return orderSuccessTranslation;

  // Jeśli nie znaleziono tłumaczenia, zwróć oryginalną wartość
  return contentType;
};
