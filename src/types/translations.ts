// src/types/translations.ts

export interface NestedMessages {
  [key: string]:
    | string
    | NestedMessages
    | Array<string | NestedMessages>
    | undefined;
}

export interface UserData {
  name: string;
  email: string;
  id: string;
  role: string;
  accountBalance: number;
  notificationPermissions: {
    browser?: boolean;
    sound?: boolean;
  };
  newsletterPreferences: {
    [key: string]: boolean;
  };
  companyDetails?: {
    companyName?: string;
    nip?: string;
    address?: string;
    buildingNumber?: string;
    postalCode?: string;
    city?: string;
  };
}

export interface FormTranslations {
  fields: {
    [key: string]: string;
    buildingNumberPlaceholder: string;
    name: string;
    companyName: string;
    nip: string;
    address: string;
    buildingNumber: string;
    postalCode: string;
    city: string;
  };
  submit: string;
  noChangesTooltip: string;
  success: {
    title: string;
    message: string;
  };
  error: {
    title: string;
    message: string;
    unknown?: string;
  };
}

export interface ChangePasswordTranslations {
  title: string;
  submit: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  noChangesTooltip: string;
  success: {
    title: string;
    message: string;
  };
  error: {
    title: string;
    message: string;
    unknown: string;
    mismatch: string;
  };
}

export interface ProfileTranslations {
  title: string;
  form: FormTranslations;
  changePassword: ChangePasswordTranslations;
}

export interface TranslationMessages {
  profile?: ProfileTranslations;
  orderHistory: OrderHistoryTranslations;
  [key: string]: any;
}

export interface OrderHistoryTranslations {
  title: string;
  status: {
    all: string;
    waiting: string;
    inProgress: string;
    completed: string;
  };
  table: {
    number: string;
    topic: string;
    orderDate: string;
    status: string;
    price: string;
    characters: string;
    language: string;
    refreshStatus: string;
    noTitle: string;
  };
  order: {
    details: string;
    guidelines: string;
    status: {
      completed: string;
      inProgress: string;
      waiting: string;
    };
  };
  content: {
    generatedContent: string;
    attachments: {
      yours: string;
      fromService: string;
    };
  };
  pagination: {
    page: string;
    of: string;
  };
}

