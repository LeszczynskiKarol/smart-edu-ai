// backend/src/controllers/workTypePageController.js
const WorkTypePage = require('../models/WorkTypePage');
const WorkType = require('../models/WorkType');
const Subject = require('../models/Subject');

exports.getMainWorkTypePage = async (req, res) => {
  try {
    const { workType } = req.params;

    // Znajdź stronę bez filtrowania category
    const page = await WorkTypePage.findOne({
      workType: workType,
    }).lean();

    if (!page) {
      return res.status(404).json({ message: 'Nie znaleziono strony' });
    }

    const pageData = {
      ...page,
      heroFeatures: page.heroFeatures || [],
      sectionsVisibility: page.sectionsVisibility || {
        hero: true,
        benefits: true,
        process: true,
        video: true,
        services: true,
        howItWorks: true,
        educationLevels: true,
        pricing: true,
      },
    };
    console.log('Wysyłane dane:', pageData);
    res.json(pageData);
  } catch (error) {
    console.error('Błąd w getMainWorkTypePage:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkTypeSubjectPage = async (req, res) => {
  try {
    const { workType, subject } = req.params;

    const workTypeDoc = await WorkType.findOne({ slugEn: workType });
    const subjectDoc = await Subject.findOne({ slugEn: subject });

    if (!workTypeDoc || !subjectDoc) {
      return res.status(404).json({ message: 'Nie znaleziono strony' });
    }

    const page = await WorkTypePage.findOne({
      workType: workTypeDoc._id,
      subject: subjectDoc._id,
      specialization: null,
    });

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkTypeSpecializationPage = async (req, res) => {
  try {
    const { workType, subject, specialization } = req.params;

    const workTypeDoc = await WorkType.findOne({ slugEn: workType });
    const subjectDoc = await Subject.findOne({ slugEn: subject });

    if (!workTypeDoc || !subjectDoc) {
      return res.status(404).json({ message: 'Nie znaleziono strony' });
    }

    const page = await WorkTypePage.findOne({
      workType: workTypeDoc._id,
      subject: subjectDoc._id,
      specialization,
    });

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.workType) {
      return res.status(400).json({
        message: 'Typ pracy jest wymagany',
      });
    }

    if (!data.sectionsVisibility.benefits) {
      data.benefits = [];
      data.benefitsSectionTitle = '';
      data.benefitsSectionTitleEn = '';
    }

    if (!data.sectionsVisibility.process) {
      data.processSteps = [];
      data.processSectionTitle = '';
      data.processSectionTitleEn = '';
    }

    if (!data.sectionsVisibility.video) {
      data.videoTitle = '';
      data.videoTitleEn = '';
      data.videoDescription = '';
      data.videoDescriptionEn = '';
      data.videoUrl = '';
    }

    if (!data.sectionsVisibility.services) {
      data.services = [];
      data.servicesSectionTitle = '';
      data.servicesSectionTitleEn = '';
    }

    if (!data.sectionsVisibility.howItWorks) {
      data.howItWorksSteps = [];
      data.howItWorksSectionTitle = '';
      data.howItWorksSectionTitleEn = '';
    }

    if (!data.sectionsVisibility.educationLevels) {
      data.educationLevels = [];
      data.educationLevelsSectionTitle = '';
      data.educationLevelsSectionTitleEn = '';
    }

    if (!data.sectionsVisibility.pricing) {
      data.pricingPlans = [];
      data.pricingSectionTitle = '';
      data.pricingSectionTitleEn = '';
    }

    const page = new WorkTypePage(data);
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    console.error('Błąd podczas tworzenia strony:', error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

exports.updatePage = async (req, res) => {
  try {
    console.log('Otrzymane dane do aktualizacji:', req.body);
    console.log('sectionsVisibility w danych:', req.body.sectionsVisibility);

    const data = { ...req.body };

    // Sprawdź sekcję benefits
    if (!data.sectionsVisibility.benefits) {
      data.benefits = [];
      data.benefitsSectionTitle = '';
      data.benefitsSectionTitleEn = '';
    } else if (data.benefits && Array.isArray(data.benefits)) {
      // Sprawdź czy każdy benefit ma wszystkie wymagane pola
      data.benefits = data.benefits.filter(
        (benefit) =>
          benefit.title &&
          benefit.titleEn &&
          benefit.description &&
          benefit.descriptionEn &&
          benefit.icon
      );
    }

    // Sprawdź czy są wszystkie wymagane pola
    if (!data.sectionsVisibility) {
      return res.status(400).json({
        message: 'Brak wymaganych pól sectionsVisibility',
      });
    }

    // Hero sekcja
    if (!data.sectionsVisibility.hero) {
      data.heroTitle = '';
      data.heroTitleEn = '';
      data.heroSubtitle = '';
      data.heroSubtitleEn = '';
      data.heroCta = '';
      data.heroCtaEn = '';
      data.heroFeatures = [];
    }

    // Benefits sekcja
    if (!data.sectionsVisibility.benefits) {
      data.benefits = [];
      data.benefitsSectionTitle = '';
      data.benefitsSectionTitleEn = '';
    }

    // Process sekcja
    if (!data.sectionsVisibility.process) {
      data.processSteps = [];
      data.processSectionTitle = '';
      data.processSectionTitleEn = '';
    }

    // Video sekcja
    if (!data.sectionsVisibility.video) {
      data.videoUrl = '';
      data.videoTitle = '';
      data.videoTitleEn = '';
      data.videoDescription = '';
      data.videoDescriptionEn = '';
    }

    // Services sekcja
    if (!data.sectionsVisibility.services) {
      data.services = [];
      data.servicesSectionTitle = '';
      data.servicesSectionTitleEn = '';
    }

    // How It Works sekcja
    if (!data.sectionsVisibility.howItWorks) {
      data.howItWorksSteps = [];
      data.howItWorksSectionTitle = '';
      data.howItWorksSectionTitleEn = '';
    }

    // Education Levels sekcja
    if (!data.sectionsVisibility.educationLevels) {
      data.educationLevels = [];
      data.educationLevelsSectionTitle = '';
      data.educationLevelsSectionTitleEn = '';
    }

    // Pricing sekcja
    if (!data.sectionsVisibility.pricing) {
      data.pricingPlans = [];
      data.pricingSectionTitle = '';
      data.pricingSectionTitleEn = '';
    }

    console.log('Dane przygotowane do aktualizacji:', data);

    const updatedPage = await WorkTypePage.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('Po aktualizacji:', updatedPage);

    if (!updatedPage) {
      return res.status(404).json({ message: 'Strona nie znaleziona' });
    }

    res.json(updatedPage);
  } catch (error) {
    console.error('Błąd podczas aktualizacji:', error);
    res.status(500).json({
      message: error.message,
      details: error.stack,
    });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const page = await WorkTypePage.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Strona nie znaleziona' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPages = async (req, res) => {
  try {
    const pages = await WorkTypePage.find().sort({ createdAt: -1 });

    // Przekształcamy dane do formatu wymaganego przez Select, dodając _id
    const formattedPages = pages.map((page) => ({
      _id: page._id, // dodajemy ID
      value: page.workType,
      label: page.workType,
      valueEn: page.workType,
      workType: page.workType,
      title: page.title,
      titleEn: page.titleEn,
      category: page.category,
      subcategory: page.subcategory,
      createdAt: page.createdAt,
      slug: page.slug,
      slugEn: page.slugEn,
    }));

    console.log('Sformatowane strony dla Selecta:', formattedPages);
    res.json(formattedPages);
  } catch (error) {
    console.error('Error in getAllPages:', error);
    res.status(500).json({
      message: error.message,
      pages: [],
    });
  }
};

exports.getPageById = async (req, res) => {
  try {
    console.log('Otrzymane ID:', req.params.id);
    if (!req.params.id) {
      return res.status(400).json({ message: 'Brak ID strony' });
    }

    const page = await WorkTypePage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ message: 'Strona nie znaleziona' });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addWorkType = async (req, res) => {
  try {
    const { name, nameEn } = req.body;

    // Zmieniamy - używamy nameEn do generowania głównego sluga
    const slug = nameEn
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Zostawiamy slugEn jako backup
    const slugEn = nameEn
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Sprawdzamy duplikaty używając nameEn
    const existingPage = await WorkTypePage.findOne({
      $or: [{ slug }, { slugEn }, { titleEn: nameEn }],
    });

    if (existingPage) {
      return res.status(400).json({
        message: 'Strona o takiej nazwie angielskiej lub URL już istnieje',
      });
    }

    const page = new WorkTypePage({
      workType: slugEn, // używamy slugEn jako workType
      title: name,
      titleEn: nameEn,
      slug: slugEn,
      slugEn,
      content: 'Domyślna treść',
      contentEn: 'Default content',
      metaTitle: name,
      metaTitleEn: nameEn,
      metaDescription: name,
      metaDescriptionEn: nameEn,
    });

    await page.save();
    res.status(201).json(page);
  } catch (error) {
    console.error('Błąd podczas dodawania typu pracy:', error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

exports.getWorkTypes = async (req, res) => {
  try {
    // Teraz pobieramy z WorkTypePage zamiast WorkType
    const pages = await WorkTypePage.find({ category: null, subcategory: null })
      .select('workType title titleEn slug slugEn')
      .sort({ title: 1 });

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
