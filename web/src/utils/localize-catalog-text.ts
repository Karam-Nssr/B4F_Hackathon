import localizeProductTitle from "@/utils/localize-product-title";

const CATEGORY_LABELS_AR: Record<string, string> = {
  Accessories: "إكسسوارات",
  "Aleppo Soap": "صابون حلبي",
  "Aleppo Sweets": "حلويات حلبية",
  "Bakery & Sweets": "مخبوزات وحلويات",
  "Carpets & Rugs": "سجاد وبسط",
  "Citrus & Preserves": "حمضيات ومعلبات",
  Clothing: "ملابس",
  "Clothing & Textiles": "ألبسة ومنسوجات",
  "Coffee & Roastery": "قهوة ومحمصة",
  "Coffee & Tea": "قهوة وشاي",
  "Embroidery & Textiles": "تطريز ومنسوجات",
  "Fresh Produce": "منتجات طازجة",
  "General Store": "متجر عام",
  Gifts: "هدايا",
  Groceries: "بقالة",
  "Handmade Gifts": "هدايا يدوية",
  "Home Decor": "ديكور المنزل",
  "Home & Living": "المنزل والمعيشة",
  "Household Supplies": "مستلزمات منزلية",
  "Leather Bags": "حقائب جلدية",
  "Leather Goods": "منتجات جلدية",
  "Local Crafts": "حرف محلية",
  "Natural Care": "عناية طبيعية",
  Ornaments: "زينة",
  "Pantry & Household Goods": "مؤن وأدوات منزلية",
  "Personal Care": "عناية شخصية",
  Spices: "بهارات",
  "Spices & Herbs": "بهارات وأعشاب",
  "Sweets & Bakery": "حلويات ومخبوزات",
  Sweets: "حلويات",
  "Syrian Spices": "بهارات سورية",
  "Tea & Coffee": "شاي وقهوة",
  "Traditional Clothing": "أزياء تراثية",
};

const SHOP_NAMES_AR: Record<string, string> = {
  "Damascus Demo Market": "سوق دمشق التجريبي",
  "Homs Pantry": "مؤونة حمص",
  "Aleppo Soap House": "بيت صابون حلب",
  "Damascus Natural Care": "العناية الطبيعية الدمشقية",
  "Bab Touma Spices": "بهارات باب توما",
  "Old City Herbs": "أعشاب المدينة القديمة",
  "Damascus Tailoring": "خياطة دمشق",
  "Aleppo Embroidery": "تطريز حلب",
  "Levant Rugs": "سجاد بلاد الشام",
  "Hama Homeware": "أدوات منزلية من حماة",
  "Souq Handmade Gifts": "هدايا سوق دمشق اليدوية",
  "Artisan Corner": "ركن الحرفيين",
  "Damascus Coffee Roasters": "محمصة دمشق",
  "Aleppo Tea House": "بيت الشاي الحلبي",
  "Aleppo Baklava House": "بيت بقلاوة حلب",
  "Damascus Maamoul Bakery": "مخبز معمول دمشق",
  "Ghouta Citrus & Preserves": "حمضيات ومعلبات الغوطة",
  "Homs Fresh Harvest": "محاصيل حمص الطازجة",
  "Damascus Leatherworks": "مصنوعات جلدية دمشقية",
  "Aleppo Leather Bags": "حقائب جلدية حلبية",
};

const SHOP_DESCRIPTIONS_AR: Record<string, string> = {
  "A sample Damascus shop featuring pantry staples and local crafts.":
    "متجر دمشقي تجريبي يضم مؤنًا أساسية وحرفًا محلية.",
  "A neighborhood market carrying pantry staples, Aleppo soap, and locally made home goods.":
    "متجر حيّ يوفّر المؤن الأساسية وصابون حلب والمنتجات المنزلية المصنوعة محليًا.",
  "Traditional laurel and olive oil soaps made in the Aleppo style.":
    "صابون تقليدي بالغار وزيت الزيتون، مصنوع على الطريقة الحلبية.",
  "Olive, laurel, and rose-based personal care from local makers.":
    "منتجات عناية شخصية محلية بمكونات الزيتون والغار والورد.",
  "Freshly packed spices inspired by Damascus market kitchens.":
    "بهارات معبأة طازجًا مستوحاة من مطابخ أسواق دمشق.",
  "Herbs and spice blends for classic Levantine recipes.":
    "أعشاب وخلطات بهارات لوصفات بلاد الشام التقليدية.",
  "Traditional and contemporary clothing sewn by local tailors.":
    "أزياء تقليدية وعصرية يخيطها خياطون محليون.",
  "Hand-embroidered textiles and cotton pieces from Aleppo makers.":
    "منسوجات وقطع قطنية مطرزة يدويًا على أيدي حرفيين من حلب.",
  "Woven rugs, runners, and cushions in traditional Levantine patterns.":
    "سجاد ومفارش ووسائد منسوجة بنقوش بلاد الشام التقليدية.",
  "Ceramics and practical home pieces from Syrian workshops.":
    "خزفيات وقطع منزلية عملية من ورش سورية.",
  "Small handmade gifts inspired by the old Damascus souqs.":
    "هدايا يدوية صغيرة مستوحاة من أسواق دمشق القديمة.",
  "Hand-finished ceramics, embroidery, and gifts from local artisans.":
    "خزفيات ومطرزات وهدايا بلمسات نهائية يدوية من حرفيين محليين.",
  "Freshly roasted coffee prepared for Syrian hospitality.":
    "قهوة محمصة طازجًا لضيافة سورية أصيلة.",
  "Arabic coffee, tea, and cardamom blends packed in Aleppo.":
    "قهوة عربية وشاي وخلطات بالهيل معبأة في حلب.",
  "Pistachio baklava and traditional sweets prepared in small batches.":
    "بقلاوة بالفستق وحلويات تقليدية تُحضّر بكميات صغيرة.",
  "Maamoul, barazek, and Syrian bakery favorites made fresh.":
    "معمول وبرازق ومخبوزات سورية محبوبة تُحضّر طازجة.",
  "Seasonal citrus, fruit, vegetables, and preserves sourced from farms around Damascus.":
    "حمضيات وفواكه وخضراوات ومعلبات موسمية من مزارع حول دمشق.",
  "Seasonal fruit and vegetables selected from nearby growers.":
    "فواكه وخضراوات موسمية مختارة من مزارعين قريبين.",
  "Hand-stitched bags and accessories made by Damascus leatherworkers.":
    "حقائب وإكسسوارات مخيطة يدويًا على أيدي حرفيي الجلود في دمشق.",
  "Everyday leather bags and accessories finished by Aleppo makers.":
    "حقائب جلدية وإكسسوارات يومية بلمسات نهائية من حرفيين حلبيين.",
};

const PRODUCT_SET_DESCRIPTIONS_AR: Record<string, string> = {
  "A carefully selected pantry staple from Syrian growers and makers.":
    "منتج أساسي مختار بعناية من مزارعين وصنّاع سوريين.",
  "A small-batch care product made with familiar olive, laurel, and rose ingredients.":
    "منتج عناية يُحضّر بكميات صغيرة من مكونات مألوفة مثل الزيتون والغار والورد.",
  "Freshly packed Syrian spices and herbs selected for Levantine cooking.":
    "بهارات وأعشاب سورية معبأة طازجًا ومختارة لمطبخ بلاد الشام.",
  "A textile piece stitched or woven by Syrian makers using durable, traditional techniques.":
    "قطعة نسيج مخيطة أو منسوجة بأيدي صنّاع سوريين باستخدام تقنيات تقليدية متينة.",
  "A practical home piece inspired by Syrian weaving, ceramics, and inlay work.":
    "قطعة منزلية عملية مستوحاة من النسيج والخزف والتطعيم السوري.",
  "A locally made gift finished by hand in a small Syrian workshop.":
    "هدية محلية أُنجزت يدويًا في ورشة سورية صغيرة.",
  "A freshly packed coffee or tea selected for everyday Syrian hospitality.":
    "قهوة أو شاي معبأ طازجًا ومختار لضيافة سورية يومية.",
  "A freshly prepared Syrian sweet made with regional ingredients and traditional recipes.":
    "حلوى سورية طازجة بمكونات محلية ووصفات تقليدية.",
  "Seasonal produce sourced from Syrian farms and packed for local delivery.":
    "منتجات موسمية من مزارع سورية ومعبأة للتوصيل المحلي.",
  "A durable leather accessory cut and finished by a Syrian craft workshop.":
    "إكسسوار جلدي متين قصّته وأنهته ورشة حرفية سورية.",
};

const PRODUCT_DESCRIPTIONS_AR: Record<string, string> = {
  "Cold-pressed olive oil from family groves near Aleppo.":
    "زيت زيتون معصور على البارد من بساتين عائلية قرب حلب.",
  "Hand-cut Aleppo laurel soap bars made with olive oil and laurel oil.":
    "قوالب صابون غار حلبي مقطعة يدويًا ومصنوعة من زيت الزيتون وزيت الغار.",
  "A cushion cover finished with traditional Syrian embroidery.":
    "غطاء وسادة مزين بتطريز سوري تقليدي.",
};

export const localizeCategory = (category: string, locale: string) =>
  locale === "ar" ? (CATEGORY_LABELS_AR[category] ?? category) : category;

export const localizeShopName = (shopName: string, locale: string) =>
  locale === "ar" ? (SHOP_NAMES_AR[shopName] ?? shopName) : shopName;

export const localizeShopDescription = (
  description: string,
  locale: string,
) =>
  locale === "ar"
    ? (SHOP_DESCRIPTIONS_AR[description] ?? description)
    : description;

export const localizeProductDescription = (
  description: string,
  title: string,
  locale: string,
) => {
  if (locale !== "ar") return description;

  const exactTranslation = PRODUCT_DESCRIPTIONS_AR[description];
  if (exactTranslation) return exactTranslation;

  const descriptionPrefix = `${title}. `;
  if (description.startsWith(descriptionPrefix)) {
    const productSetDescription = description.slice(descriptionPrefix.length);
    const translatedSetDescription =
      PRODUCT_SET_DESCRIPTIONS_AR[productSetDescription];
    if (translatedSetDescription) {
      return `${localizeProductTitle(title, locale)}. ${translatedSetDescription}`;
    }
  }

  return description;
};
