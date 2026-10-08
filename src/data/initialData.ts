import {
  Branding,
  HeroSlide,
  Autobiography,
  EducationMilestone,
  ExperienceEntry,
  BlogArticle,
  FAQItem,
  UsefulLink,
  DownloadItem,
  GalleryItem,
  PatientInquiry
} from '../types';

export const initialBranding: Branding = {
  doctorName: {
    en: 'Dr. Prem Raj Joshi',
    np: 'डा. प्रेम राज जोशी'
  },
  degreeTitle: {
    en: 'BAMS (IOM, TU) · Ayurvedic Physician',
    np: 'बीएएमएस (आईओएम, त्रिवि) · आयुर्वेदिक चिकित्सक'
  },
  tagline: {
    en: 'Integrative Ayurvedic Healthcare, Classical Therapeutics & Holistic Wellness',
    np: 'एकीकृत आयुर्वेदिक चिकित्सा, शास्त्रीय उपचार तथा समग्र स्वास्थ्य परामर्श'
  },
  logoUrl: '/assets/images/doctor_portrait_1791392878397.jpg',
  flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg',
  nmcNumber: 'NMC Reg. 1824 / AYU-NP',
  phone: '+977-9848721200',
  email: 'drpremrajjoshi@gmail.com',
  currentLocation: {
    en: 'Maharajgunj Medical Zone, Kathmandu, Nepal',
    np: 'महाराजगञ्ज मेडिकल क्षेत्र, काठमाडौं, नेपाल'
  },
  permanentAddress: {
    en: 'Dhangadhi Sub-Metropolitan, Kailali, Sudurpashchim, Nepal',
    np: 'धनगढी उपमहानगरपालिका, कैलाली, सुदूरपश्चिम, नेपाल'
  },
  address: {
    en: 'Kathmandu Clinic: Maharajgunj, Kathmandu | Sudurpashchim Center: Dhangadhi, Kailali',
    np: 'काठमाडौं क्लिनिक: महाराजगञ्ज, काठमाडौं | सुदूरपश्चिम केन्द्र: धनगढी, कैलाली'
  },
  stats: {
    stat1Value: '5.5+',
    stat1LabelEn: 'Years Medical Degree',
    stat1LabelNp: 'वर्षे चिकित्सा अध्ययन (BAMS)',
    stat2Value: '4,500+',
    stat2LabelEn: 'Patients Treated',
    stat2LabelNp: 'बिरामीहरूको सफल उपचार',
    stat3Value: '18+',
    stat3LabelEn: 'Rural Camps',
    stat3LabelNp: 'निःशुल्क ग्रामीण स्वास्थ्य शिविर'
  },
  youtubeEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  socialLinks: {
    facebook: 'https://facebook.com/drpremrajjoshi',
    instagram: 'https://instagram.com/drpremrajjoshi',
    tiktok: 'https://tiktok.com/@drpremrajjoshi',
    twitter: 'https://twitter.com/drpremrajjoshi',
    youtube: 'https://youtube.com/@drpremrajjoshi',
    whatsapp: 'https://wa.me/9779848721200'
  }
};

export const initialHeroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    imageUrl: '/assets/images/hero_ayurveda_clinic_1791392890876.jpg',
    titleEn: 'Ancient Healing Wisdom Meets Modern Diagnostics',
    titleNp: 'प्राचीन वैदिक ज्ञान र आधुनिक चिकित्साको वैज्ञानिक संगम',
    subtitleEn: 'Personalized holistic consultations by Dr. Prem Raj Joshi, graduate of Institute of Medicine (IOM), TU.',
    subtitleNp: 'त्रिवि चिकित्सा शास्त्र अध्ययन संस्थान (IOM) का स्नातक डा. प्रेम राज जोशीद्वारा व्यक्तिगत स्वास्थ्य सेवा।',
    ctaTextEn: 'Book Appointment',
    ctaTextNp: 'अपोइन्टमेन्ट लिनुहोस्',
    ctaLink: '#appointment',
    order: 1
  },
  {
    id: 'slide-2',
    imageUrl: '/assets/images/hero_himalayan_wellness_1791392913647.jpg',
    titleEn: 'Root-Cause Therapeutics for Chronic Ailments',
    titleNp: 'दीर्घरोगहरूको जडबाटै निदान र प्राकृतिक उपचार',
    subtitleEn: 'Evidence-informed Ayurvedic care for digestive disorders, metabolic health, arthritis, and lifestyle harmony.',
    subtitleNp: 'पाचन प्रणाली, बाथ रोग, अनिद्रा तथा जीवनशैलीजन्य समस्याहरूको सुरक्षित र दिगो समाधान।',
    ctaTextEn: 'Explore Health Blogs',
    ctaTextNp: 'स्वास्थ्य लेखहरू पढ्नुहोस्',
    ctaLink: '#blogs',
    order: 2
  },
  {
    id: 'slide-3',
    imageUrl: '/assets/images/academic_iom_tu_1791392932848.jpg',
    titleEn: 'Academic Rigor & Medical Compassion',
    titleNp: 'चिकित्सकीय निष्ठा तथा जनस्वास्थ्य सेवामा समर्पण',
    subtitleEn: 'Committed to evidence-based Ayurvedic medicine, preventive community health, and patient education across Nepal.',
    subtitleNp: 'प्रमाणमा आधारित आयुर्वेद चिकित्सा, निःशुल्क स्वास्थ्य शिविर तथा स्वास्थ्य चेतना विस्तार।',
    ctaTextEn: 'Read Autobiography',
    ctaTextNp: 'परिचय तथा जीवनी',
    ctaLink: '#about',
    order: 3
  }
];

export const initialAutobiography: Autobiography = {
  kickerEn: 'About Me',
  kickerNp: 'मेरो बारेमा',
  summaryEn: 'Dr. Prem Raj Joshi is a distinguished Ayurvedic Physician with a Bachelor of Ayurvedic Medicine and Surgery (BAMS) from the prestigious Institute of Medicine (IOM), Maharajgunj Medical Campus, Tribhuvan University. Blending authentic classical Ayurvedic principles with contemporary clinical understanding, he specializes in chronic metabolic disorders, gastrointestinal disorders (Amlapitta, Grahani), musculoskeletal pain, and stress management.',
  summaryNp: 'डा. प्रेम राज जोशी त्रिभुवन विश्वविद्यालय, चिकित्सा शास्त्र अध्ययन संस्थान (IOM) महाराजगञ्ज क्याम्पसबाट बीएएमएस (BAMS) उपाधि प्राप्त एक समर्पित र अनुभवी आयुर्वेदिक चिकित्सक हुनुहुन्छ। उहाँले प्राचीन शास्त्रीय ज्ञानलाई आधुनिक निदान विधिसँग संयोजन गर्दै पाचन विकार, बाथरोग, अम्लपित्त, उच्च रक्तचाप तथा मानसिक तनावको सफल उपचार प्रदान गर्दै आउनुभएको छ।',
  fullBioEn: `Dr. Prem Raj Joshi completed his rigorous 5.5-year medical degree in Ayurvedic Medicine and Surgery (BAMS) from the Institute of Medicine (IOM), Tribhuvan University, Nepal's premier medical academy. During his residency and hospital training at the Ayurveda Teaching Hospital, Kirtipur, he gathered extensive hands-on experience in pulse diagnosis (Nadi Pariksha), constitutional assessment (Prakriti Pariksha), classical Panchakarma detox therapies, and customized herbal formulation.

Over years of clinical practice, Dr. Joshi has consulted thousands of patients across Kathmandu, Dhangadhi, and rural health camps throughout Nepal. His clinical philosophy centers on 'Swasthasya Swasthya Rakshanam' (preserving the health of the healthy) and 'Aturasya Vikara Prashamanam' (eradicating the diseases of the afflicted). He emphasizes disease prevention, circadian eating routines (Ahara Vidhi), seasonal detox (Ritucharya), and gentle restorative herbal formulations.

Beyond his clinical practice, Dr. Joshi is an avid educator, frequently conducting community wellness workshops, participating in national health seminars, and publishing bilingual health literature to raise scientific awareness about Nepal's rich medicinal plant biodiversity.`,
  fullBioNp: `डा. प्रेम राज जोशीले नेपालको शीर्ष चिकित्सा संस्था त्रिभुवन विश्वविद्यालय, चिकित्सा शास्त्र अध्ययन संस्थान (IOM) महाराजगञ्ज क्याम्पसबाट साढे पाँच वर्षे चिकित्सा अध्ययन (BAMS) विशिष्टताका साथ सम्पन्न गर्नुभएको हो। आयुर्वेद शिक्षण अस्पताल कीर्तिपुरमा इन्टर्नसिप तथा क्लिनिकल तालिमका क्रममा उहाँले नाडी परीक्षा, प्रकृति विश्लेषण, शास्त्रीय पञ्चकर्म र जडीबुटी संयोजनमा गहन दख्खल हासिल गर्नुभयो।

विगत लामो समयदेखि काठमाडौं तथा धनगढीका विभिन्न स्वास्थ्य केन्द्रहरूमा हजारौं बिरामीहरूको सफल उपचार गर्नुभएका डा. जोशीले विशेषगरी पेट सम्बन्धी समस्या (ग्यास्ट्रिक, अम्लपित्त, आइबीएस), युरिक एसिड, बाथरोग, अनिद्रा र तनावको समग्र उपचारमा उत्कृष्ट नतिजा दिनुभएको छ।

"स्वस्थस्य स्वास्थ्य रक्षणम्, आतुरस्य विकार प्रशमनम् च" अर्थात् स्वस्थ व्यक्तिको स्वास्थ्य जोगाइराख्नु र बिरामीको रोगलाई जरादेखि निर्मूल गर्नु नै उहाँको मूल चिकित्सकीय लक्ष्य हो। उहाँ जनस्वास्थ्य प्रवर्द्धन, निःशुल्क स्वास्थ्य शिविर तथा स्वास्थ्य परामर्शमा निरन्तर सक्रिय रहनुभएको छ।`,
  philosophyEn: 'True healing does not merely suppress symptoms; it restores harmony between body, mind, and the environmental elements through scientific diet, natural medicine, and balanced daily habits.',
  philosophyNp: 'साँचो उपचार भनेको केवल लक्षण दबाउनु मात्र होइन; शरीर, मन र प्रकृतिका पञ्चमहाभूतहरूबीच सन्तुलन कायम गरी रोगको जडलाई समाप्त गर्नु हो।',
  specialties: {
    en: [
      'Gastrointestinal & Digestive Health (Amlapitta, IBS, Constipation)',
      'Musculoskeletal & Joint Disorders (Amavata, Sandhivata, Sciatica)',
      'Metabolic & Lifestyle Diseases (Diabetes Support, Liver Health)',
      'Mental Wellbeing & Sleep Optimization (Medhya Rasayana)',
      'Classical Panchakarma & Seasonal Cleansing Protocols',
      'Personalized Prakriti (Constitutional) Diet Plans'
    ],
    np: [
      'पेट तथा पाचन प्रणालीका रोग (अम्लपित्त, ग्यास्ट्रिक, कब्जियत, आईबीएस)',
      'बाथ रोग, जोर्नी दुखाइ तथा ढाडको समस्या (सन्धिवात, आमवात)',
      'मेटाबोलिक तथा जीवनशैलीजन्य समस्या (कलेजो र बोसो व्यवस्थापन)',
      'मानसिक तनाव, चिन्ता तथा अनिद्राको प्राकृतिक उपचार',
      'शास्त्रीय पञ्चकर्म तथा ऋतु अनुसारको शरीर शोधन',
      'प्रकृति अनुसारको व्यक्तिगत खानपान र जीवनशैली परामर्श'
    ]
  },
  avatarUrl: '/assets/images/doctor_portrait_1791392878397.jpg'
};

export const initialEducation: EducationMilestone[] = [
  {
    id: 'edu-1',
    slug: 'bams-iom-tu',
    degreeEn: 'Bachelor of Ayurvedic Medicine and Surgery (BAMS)',
    degreeNp: 'आयुर्वेद चिकित्सा तथा शल्यचिकित्सा स्नातक (बीएएमएस)',
    institutionEn: 'Institute of Medicine (IOM), Maharajgunj Medical Campus, Tribhuvan University',
    institutionNp: 'चिकित्सा शास्त्र अध्ययन संस्थान (IOM), महाराजगञ्ज मेडिकल क्याम्पस, त्रिवि, काठमाडौं',
    year: '2015 - 2021',
    descriptionEn: 'Rigorous 5.5-year medical curriculum including foundational anatomy, pharmacology, pathology, classical Ayurvedic Samhitas (Charaka, Sushruta, Vagbhata), internal medicine (Kayachikitsa), ENT/Ophthalmology (Shalakya), Surgery (Shalya Tantra), and Gynecology (Prasuti Tantra).',
    descriptionNp: '५.५ वर्षे पूर्णकालीन चिकित्सा अध्ययन। आधुनिक शरीर रचना, रोग निदान तथा चरक, सुश्रुत, वाग्भट संहिता, कायचिकित्सा, शल्यतन्त्र, शालाक्यतन्त्र र प्रसूतीतन्त्रमा सैद्धान्तिक तथा व्यावहारिक निपुणता।',
    honorsEn: 'Graduated with First Division · Merit Scholarship Awardee',
    honorsNp: 'प्रथम श्रेणीमा उत्तीर्ण · योग्यता छात्रवृत्ति प्राप्त',
    imageUrl: '/assets/images/academic_iom_tu_1791392932848.jpg'
  },
  {
    id: 'edu-2',
    slug: 'clinical-residency-kirtipur',
    degreeEn: 'Compulsory Rotatory Medical Internship & Residency',
    degreeNp: 'एकवर्षे अनिवार्य क्लिनिकल आवासीय इन्टर्नसिप',
    institutionEn: 'Ayurveda Teaching Hospital, Kirtipur & Maharajgunj Campus',
    institutionNp: 'आयुर्वेद शिक्षण अस्पताल, कीर्तिपुर तथा महाराजगञ्ज',
    year: '2020 - 2021',
    descriptionEn: '12 months of high-intensity clinical rotations across Outpatient (OPD), Inpatient (IPD), Emergency, Panchakarma therapy suites, and Herbal Formulation Pharmacy.',
    descriptionNp: 'अन्तरङ्ग (IPD), बहिरङ्ग (OPD), आकस्मिक कक्ष, पञ्चकर्म कक्ष तथा फार्मेसीमा बिरामी जाँच्ने र उपचार गर्ने गहन क्लिनिकल अभ्यास।',
    honorsEn: 'Excellence in Clinical Case Management',
    honorsNp: 'उत्कृष्ट क्लिनिकल सेवा प्रशंसा पत्र',
    imageUrl: '/assets/images/hero_ayurveda_clinic_1791392890876.jpg'
  },
  {
    id: 'edu-3',
    slug: 'isc-ascol-tu',
    degreeEn: 'Intermediate in Science (I.Sc. / +2 Science)',
    degreeNp: 'प्रवीणता प्रमाणपत्र तह (विज्ञान)',
    institutionEn: 'Amrit Science Campus (ASCOL), Tribhuvan University / HSEB',
    institutionNp: 'अमृत साइन्स क्याम्पस (अस्कल), काठमाडौं',
    year: '2012 - 2014',
    descriptionEn: 'Majored in Biology, Chemistry, and Physics with distinction, establishing a solid foundation in biological sciences.',
    descriptionNp: 'जीवविज्ञान, रसायनशास्त्र र भौतिकशास्त्र विषयमा उत्कृष्ट नतिजासहित विज्ञान संकाय उत्तीर्ण।',
    honorsEn: 'Distinction Division',
    honorsNp: 'विशिष्ट श्रेणी'
  }
];

export const initialExperience: ExperienceEntry[] = [
  {
    id: 'exp-1',
    slug: 'consultant-ayurvedic-physician-kathmandu',
    roleEn: 'Consultant Ayurvedic Physician',
    roleNp: 'वरिष्ठ परामर्शदाता आयुर्वेदिक चिकित्सक',
    organizationEn: 'Integrative Wellness Clinic, Maharajgunj, Kathmandu',
    organizationNp: 'एकीकृत वेलनेस क्लिनिक, महाराजगञ्ज, काठमाडौं',
    period: '2022 - Present',
    locationEn: 'Kathmandu, Nepal',
    locationNp: 'काठमाडौं, नेपाल',
    descriptionEn: 'Conducting comprehensive in-person and tele-consultations for patients suffering from gastrointestinal, respiratory, metabolic, and musculoskeletal disorders. Developing evidence-guided herbal formulations and Panchakarma treatment plans.',
    descriptionNp: 'पेट, जोर्नी दुखाइ, बाथरोग तथा मानसिक स्वास्थ्य सम्बन्धी बिरामीहरूको प्रत्यक्ष र अनलाइन स्वास्थ्य परीक्षण, जडीबुटी औषधि व्यवस्थापन तथा पञ्चकर्म योजना निर्माण।',
    achievementsEn: [
      'Treated over 4,500+ patients with over 90% positive clinical recovery',
      'Designed personalized dietary guidelines based on biological dosha types',
      'Introduced digital patient inquiry tracking and follow-up consultation system'
    ],
    achievementsNp: [
      '४,५०० भन्दा बढी बिरामीहरूको सफल उपचार तथा परामर्श',
      'दोष अनुसारको वैज्ञानिक आहार तालिका निर्माण प्रणाली स्थापना',
      'डिजिटल बिरामी रेकर्ड तथा फलो-अप प्रणाली कार्यान्वयन'
    ]
  },
  {
    id: 'exp-2',
    slug: 'rural-community-health-outreach-director',
    roleEn: 'Medical Director - Community Health & Ayurveda Outreach',
    roleNp: 'निर्देशक - सामुदायिक स्वास्थ्य तथा निःशुल्क आयुर्वेद शिविर',
    organizationEn: 'Himalayan Health Promotion Society & Regional Health Camps',
    organizationNp: 'हिमालयन स्वास्थ्य प्रवर्द्धन समाज तथा क्षेत्रीय स्वास्थ्य शिविरहरू',
    period: '2021 - Present',
    locationEn: 'Sudurpashchim & Karnali Provinces, Nepal',
    locationNp: 'सुदूरपश्चिम तथा कर्णाली प्रदेश, नेपाल',
    descriptionEn: 'Leading medical teams to remote districts of Western Nepal to deliver free medical checkups, free distribution of essential herbal medicines, and community health hygiene seminars.',
    descriptionNp: 'दुर्गम जिल्लाहरूमा निःशुल्क स्वास्थ्य शिविरको नेतृत्व, निःशुल्क औषधि वितरण तथा स्थानीय नागरिकहरूलाई सरसफाइ र स्वास्थ्य शिक्षा प्रदान।',
    achievementsEn: [
      'Conducted 18+ free rural health camps treating over 8,000 citizens',
      'Documented traditional folk herbal remedies practiced by indigenous healers',
      'Conducted public awareness drives on prevention of seasonal flu and waterborne diseases'
    ],
    achievementsNp: [
      '१८ भन्दा बढी निःशुल्क शिविरमार्फत ८,००० भन्दा बढी नागरिकलाई प्रत्यक्ष स्वास्थ्य सेवा',
      'स्थानीय परम्परागत जडीबुटी ज्ञानको अभिलेखीकरण',
      'मौसमी रोग नियन्त्रण सम्बन्धी जनचेतना कार्यक्रम'
    ]
  },
  {
    id: 'exp-3',
    slug: 'medical-officer-ayurveda-teaching-hospital',
    roleEn: 'Resident Medical Officer (RMO)',
    roleNp: 'मेडिकल अधिकृत',
    organizationEn: 'Ayurveda Teaching Hospital & Research Wing, Kirtipur',
    organizationNp: 'आयुर्वेद शिक्षण अस्पताल तथा अनुसन्धान केन्द्र, कीर्तिपुर',
    period: '2021 - 2022',
    locationEn: 'Kathmandu Valley, Nepal',
    locationNp: 'काठमाडौं उपत्यका, नेपाल',
    descriptionEn: 'Managed IPD ward rounds, monitored acute admissions, assisted senior professors in Panchakarma procedures, and supervised junior intern physicians.',
    descriptionNp: 'अस्पतालका अन्तरङ्ग बिरामीहरूको हेरचाह, पञ्चकर्म प्रक्रियाहरूको प्रत्यक्ष सुपरीवेक्षण र क्लिनिकल अनुसन्धानमा सहभागिता।',
    achievementsEn: [
      'Managed acute cases of Amlapitta and Sciatica with classical Vasti therapies',
      'Co-authored clinical case audits presented at national Ayurvedic conferences'
    ],
    achievementsNp: [
      'अम्लपित्त र गृध्रसी (साइटिका) का जटिल बिरामीहरूको बस्ति चिकित्साद्वारा सफल उपचार',
      'राष्ट्रिय सम्मेलनहरूमा क्लिनिकल केस अध्ययन प्रस्तुतीकरण'
    ]
  }
];

export const initialBlogs: BlogArticle[] = [
  {
    id: 'blog-1',
    slug: 'ayurvedic-management-of-digestive-disorders',
    titleEn: 'Ayurvedic Management of Chronic Digestive Disorders (Amlapitta & Grahani)',
    titleNp: 'दीर्घ पेट सम्बन्धी समस्या, ग्यास्ट्रिक र अम्लपित्तको आयुर्वेदिक समाधान',
    excerptEn: 'Learn how classical Ayurveda identifies the root dysfunction in digestive fire (Agni) and provides lasting relief without lifelong antacid dependency.',
    excerptNp: 'आयुर्वेदमा पाचन अग्निको महत्व, ग्यास्ट्रिक/अम्लपित्त हुने मुख्य कारण र घरेलु तथा शास्त्रीय जडीबुटीबाट यसको स्थायी समाधान।',
    contentEn: `### Understanding the Root Cause: Jatharagni Dysfunction

In Ayurvedic medicine, good health begins in the gut. Acharya Charaka famously states: *"Sarve Roga Mandagnau"* — all systemic diseases originate from an impaired or sluggish digestive fire (*Agni*). When *Jatharagni* becomes vitiated due to irregular meal timings, excess chili, fermented foods, chronic mental stress, and lack of sleep, food does not digest completely. This undigested toxic residue is called **Ama**.

### Symptoms of Amlapitta (Hyperacidity & GERD)
- Burning sensation in chest and throat (Hrit-Kantha Daha)
- Sour or bitter belching (Amlodgara)
- Nausea, heaviness after meals, and morning lethargy
- Chronic headache triggered by hunger

### Holistic Ayurvedic Protocol
1. **Dietary Correction (Ahara):**
   - Strictly avoid stale food, excessive black tea/coffee, vinegar, and deep-fried items.
   - Introduce cooling grains like old barley, aged rice, and mung bean soup (*Mudga Yusha*).
   - Sip warm water or coriander-fennel seed water (*Dhanya-Mishreya Kwatha*) throughout the day.
2. **Medicinal Herbal Support (Aushadha):**
   - *Amalaki* (Indian Gooseberry) — the supreme Pitta pacifier.
   - *Shatavari* — restores gut mucosal lining and prevents acid erosion.
   - *Avipattikar Churna* — classical formulation for gentle downward elimination of excess acid.
3. **Panchakarma Intervention:**
   - In stubborn cases, therapeutic emesis (*Vamana*) or purgation (*Virechana*) under expert supervision purges the aggravated Pitta from its root seat in the duodenum.

Consult Dr. Prem Raj Joshi for a tailored assessment of your Dosha balance before self-medicating with strong herbal concentrates.`,
    contentNp: `### रोगको जड: मन्दाग्नि र पाचन विकार

आयुर्वेद शास्त्र अनुसार हाम्रो सम्पूर्ण स्वास्थ्य पेटको पाचन शक्ति अर्थात् 'जठराग्नि' मा निर्भर हुन्छ। महर्षि चरकले भन्नुभएको छ — *"सर्वे रोगा मन्दाग्नौ"* अर्थात् अधिकांश रोगहरूको उत्पत्ति कमजोर पाचन अग्निबाट हुन्छ। जब हामी अनियमित समयमा खाना खान्छौं, धेरै चिल्लो, पिरो वा बासी खानेकुरा खान्छौं, तब पाचन गडबड भएर शरीरमा **'आम'** (विषाक्त तत्व) जम्मा हुन्छ।

### अम्लपित्त (ग्यास्ट्रिक/एसिडिटी) का मुख्य लक्षणहरू:
- छाती र घाँटी पोल्ने (हृत्कण्ठ दाह)
- अमिलो डकार आउने
- पेट भारी हुने, मुखमा पानी आउने
- बिहान उठ्दा टाउको दुख्ने र अल्छी लाग्ने

### आयुर्वेदिक उपचार तथा रोकथामका उपायहरू:
१. **खानपान सुधार (आहार):**
   - बासी, तारेको, धेरै चिया र कफी तुरुन्त घटाउनुहोस्।
   - पुरानो चामल, मुङको दाल र काँक्रो, लौका जस्ता सुपाच्य तरकारी खानुहोस्।
   - धनियाँ र सौंफको मनतातो पानी पिउने बानी बसाल्नुहोस्।

२. **औषधीय जडीबुटी (औषध):**
   - **अमला:** पित्त शान्त पार्ने सर्वोत्कृष्ट प्राकृतिक फल।
   - **शतावरी:** पेटको भित्री तहलाई एसिडबाट जोगाउने बलियो कवच।
   - **अविपत्तिकर चूर्ण:** ग्यास्ट्रिक र कब्जियतको शास्त्रीय औषधि।

३. **पञ्चकर्म चिकित्सा:**
   - जटिल अवस्थामा दक्ष चिकित्सकको रेखदेखमा 'विरेचन' वा 'वमन' गराएर शरीरको पित्त दोष बाहिर निकालिन्छ।

कुनै पनि औषधि सेवन गर्नुअघि आफ्नो प्रकृति परीक्षणका लागि डा. प्रेम राज जोसीसँग परामर्श लिनु उपयुक्त हुन्छ।`,
    categoryEn: 'Digestive Health',
    categoryNp: 'पाचन स्वास्थ्य',
    authorEn: 'Dr. Prem Raj Joshi (BAMS)',
    authorNp: 'डा. प्रेम राज जोशी (BAMS)',
    publishDate: '2026-09-15',
    readTime: '5 min read',
    coverImage: '/assets/images/hero_ayurveda_clinic_1791392890876.jpg',
    metaKeywords: 'Ayurveda, Amlapitta, Gastritis Nepal, BAMS Doctor Kathmandu, Herbal Digestive Care',
    metaDescriptionEn: 'Clinical Ayurvedic guide to treating acidity, GERD, and gastritis by Dr. Prem Raj Joshi (BAMS, IOM, TU).',
    metaDescriptionNp: 'डा. प्रेम राज जोशीद्वारा ग्यास्ट्रिक, अम्लपित्त तथा पेट पोल्ने समस्याको प्राकृतिक उपचार सम्बन्धी लेख।'
  },
  {
    id: 'blog-2',
    slug: 'dinacharya-ayurvedic-secrets-for-immunity',
    titleEn: 'Dinacharya: The Ancient Daily Routine for High Vitality & Ojas',
    titleNp: 'दिनचर्या: उच्च रोग प्रतिरोधात्मक क्षमता (ओजस) का लागि दैनिक नियमहरू',
    excerptEn: 'Unlock peak energy, mental clarity, and longevity by aligning your circadian rhythm with the natural Ayurvedic daily clock.',
    excerptNp: 'बिहान उठ्ने समयदेखि राति सुत्ने बेलासम्म प्रकृतिको लय अनुसार दिनचर्या मिलाउँदा दीर्घायु र बलियो इम्युनिटी प्राप्त हुन्छ।',
    contentEn: `### The Circadian Science of Ayurveda
Nature operates in cycles, and human biology is genetically tuned to the rising and setting of the sun. Ayurveda codified this thousands of years ago into **Dinacharya** (ideal daily routine).

### Five Pillars to Practice Daily:
1. **Brahma Muhurta Jagaran (Awakening):** Wake up approximately 45–90 minutes before sunrise. The atmospheric energy is filled with pure Sattva and peace.
2. **Ushapan (Hydration):** Drink 1–2 glasses of lukewarm water stored in a copper vessel to gently stimulate bowel peristalsis.
3. **Danta Dhavana & Jihwa Nirlekhana:** Clean teeth with herbal astringents (Neem, Babool) and scrape the tongue with copper/silver to clear overnight microbial toxins.
4. **Abhyanga (Warm Oil Self-Massage):** Applying warm sesame or mustard oil to the scalp, ears, and soles of the feet pacifies Vata, strengthens musculoskeletal resilience, and calms the nervous system.
5. **Pranayama & Sadvritta:** 10 minutes of Anulom Vilom (alternate nostril breathing) clears the psychic channels (Nadis) and sharpens cognitive acuity.`,
    contentNp: `### प्रकृतिको चक्र र मानव स्वास्थ्य
हाम्रो शरीरको जैविक घडी (बायोलोजिकल क्लक) प्रकृतिको सूर्योदय र सूर्यास्तसँग जोडिएको छ। यसैलाई आयुर्वेदमा **'दिनचर्या'** भनिन्छ।

### हरेक दिन अपनाउनुपर्ने पाँच मुख्य नियम:
१. **ब्रह्म मुहूर्त जागरण:** सूर्योदयभन्दा करिब ४५ मिनेट अगाडि उठ्नुहोस्। यस समय वातावरणमा शान्ति र सकारात्मक ऊर्जा सर्वाधिक हुन्छ।
२. **उषापान:** बिहान उठ्नेबित्तिकै तामाको भाँडोमा राखिएको वा मनतातो पानी १-२ गिलास पिउनुहोस्, जसले पेट सफा गर्न मद्दत गर्छ।
३. **दन्तधावन तथा जिब्रो सफा:** नीम वा बबुलका जडीबुटीयुक्त मञ्जन प्रयोग गर्नुहोस् र जिब्रोमा जमेको फोहोर (आम) सफा गर्नुहोस्।
४. **अभ्यङ्ग (तेल मालिस):** तोरी वा तिलको मनतातो तेलले टाउको, कान र पैतालामा मालिस गर्नाले वात दोष शान्त हुन्छ र शरीर बलियो हुन्छ।
५. **प्राणायाम र ध्यान:** दैनिक १० मिनेट अनुलोम-विलोम प्राणायाम गर्नाले मानसिक एकाग्रता र फोक्सोको कार्यक्षमता वृद्धि हुन्छ।`,
    categoryEn: 'Lifestyle & Prevention',
    categoryNp: 'दिनचर्या र रोकथाम',
    authorEn: 'Dr. Prem Raj Joshi (BAMS)',
    authorNp: 'डा. प्रेम राज जोशी (BAMS)',
    publishDate: '2026-08-20',
    readTime: '4 min read',
    coverImage: '/assets/images/hero_himalayan_wellness_1791392913647.jpg',
    metaKeywords: 'Dinacharya, Ojas, Immunity, Daily routine Ayurveda Nepal',
    metaDescriptionEn: 'How to build natural immunity through classical Ayurvedic daily routine by Dr. Prem Raj Joshi.',
    metaDescriptionNp: 'दैनिक स्वस्थ दिनचर्या र रोग प्रतिरोधात्मक क्षमता बढाउने उपायहरू।'
  },
  {
    id: 'blog-3',
    slug: 'stress-insomnia-medhya-rasayana-herbs',
    titleEn: 'Overcoming Stress, Anxiety & Insomnia with Medhya Rasayana Herbs',
    titleNp: 'मानसिक तनाव, चिन्ता र अनिद्राको प्राकृतिक समाधान: मेध्य रसायन',
    excerptEn: 'How Himalayan adaptogens like Brahmi, Ashwagandha, and Shankhapushpi soothe an overstimulated nervous system without sedation.',
    excerptNp: 'ब्राह्मी, अश्वगन्धा र शङ्खपुष्पी जस्ता औषधीय वनस्पतिको प्रयोगले निद्रा र मानसिक शान्ति कसरी प्राप्त हुन्छ?',
    contentEn: `### Modern Hyperarousal & The Prana Vata Connection
Chronic occupational stress, excessive blue light from smartphones, and irregular sleep hours agitate **Prana Vata** and **Sadhaka Pitta** in the brain. This results in difficulty falling asleep, midnight awakenings, racing thoughts, and morning exhaustion.

### The Power of Medhya Rasayana:
- **Ashwagandha (Withania somnifera):** A premier adaptogen that lowers serum cortisol and supports deep restorative slow-wave sleep.
- **Brahmi (Bacopa monnieri):** Nourishes the neuronal synapses, cools mental heat, and enhances cognitive retention.
- **Shankhapushpi (Convolvulus pluricaulis):** Naturally calms excessive anxiety and stabilizes emotional fluctuations.
- **Shirodhara Therapy:** Continuous rhythmic pouring of warm medicated herbal oil (such as Ksheerabala Taila) over the forehead triggers parasympathetic dominance, relieving severe chronic insomnia.`,
    contentNp: `### आधुनिक तनाव र वात दोषको असन्तुलन
दैनिक कामको चाप, मोबाइलको अत्याधिक प्रयोग र राति अबेरसम्म बस्ने बानीले मस्तिष्कमा **'प्राण वात'** र **'साधक पित्त'** बिग्रन्छ। यसले गर्दा निद्रा नलाग्ने, बेचैनी हुने र मुटुको धड्कन बढ्ने समस्या देखिन्छ।

### मेध्य रसायन जडीबुटीहरू:
- **अश्वगन्धा:** तनाव उत्पन्न गर्ने हर्मोन घटाउँछ र गहिरो निद्रा दिलाउन सहयोग गर्छ।
- **ब्राह्मी:** स्मरणशक्ति बढाउँछ र दिमागलाई शीतल बनाई एकाग्रता प्रदान गर्छ।
- **शङ्खपुष्पी:** चिन्ता, डिप्रेसन र मानसिक थकान कम गर्ने प्राकृतिक औषधि।
- **शिरोधारा:** निधारको बीच भागमा मनतातो औषधीय तेलको धारा खन्याइने शास्त्रीय उपचार, जसले अनिद्रामा अचुक काम गर्छ।`,
    categoryEn: 'Mental Wellness',
    categoryNp: 'मानसिक स्वास्थ्य',
    authorEn: 'Dr. Prem Raj Joshi (BAMS)',
    authorNp: 'डा. प्रेम राज जोशी (BAMS)',
    publishDate: '2026-07-10',
    readTime: '6 min read',
    coverImage: '/assets/images/academic_iom_tu_1791392932848.jpg',
    metaKeywords: 'Stress, Insomnia, Ashwagandha, Brahmi Nepal, Shirodhara Kathmandu',
    metaDescriptionEn: 'Overcoming chronic stress and insomnia naturally with Dr. Prem Raj Joshi.',
    metaDescriptionNp: 'तनाव र अनिद्राबाट मुक्ति पाउने आयुर्वेदिक घरेलु तथा शास्त्रीय उपायहरू।'
  }
];

export const initialFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    categoryEn: 'Consultation & Appointments',
    categoryNp: 'परामर्श तथा अपोइन्टमेन्ट',
    questionEn: 'How can I schedule an in-person or online consultation with Dr. Prem Raj Joshi?',
    questionNp: 'डा. प्रेम राज जोसीसँग क्लिनिकमा भेट्न वा अनलाइन परामर्श लिन कसरी समय मिलाउने?',
    answerEn: 'You can easily request an appointment using the floating "Namaste" button on the bottom right of this website or by submitting the consultation inquiry form. Our clinic desk will confirm your appointment via phone/WhatsApp within 2 to 4 hours.',
    answerNp: 'यसै वेबसाइटको तल दायाँ भागमा रहेको "नमस्ते" बटन वा अपोइन्टमेन्ट फाराम भरेर सजिलै समय लिन सक्नुहुन्छ। फाराम पेश गरेपछि हाम्रो क्लिनिक डेस्कले २ देखि ४ घण्टाभित्र फोन वा ह्वाट्सएपमार्फत सम्पर्क गरी समय निश्चित गर्नेछ।',
    order: 1
  },
  {
    id: 'faq-2',
    categoryEn: 'Prescriptions & Delivery',
    categoryNp: 'औषधि तथा डेलिभरी',
    questionEn: 'Can I get Ayurvedic medicines delivered if I reside outside Kathmandu or abroad?',
    questionNp: 'काठमाडौंबाहिर वा विदेशमा बसोबास गर्ने बिरामीका लागि औषधि डेलिभरीको सुविधा छ?',
    answerEn: 'Yes! After conducting a detailed digital consultation via video/phone call, prescribed authentic Ayurvedic medicines and tailored dietary charts can be couriered to any district in Nepal via local logistics, or shipped internationally with standard export documentation.',
    answerNp: 'हो, भिडियो वा फोनमार्फत विस्तृत परामर्श लिएपछि आवश्यक प्रमाणित आयुर्वेदिक औषधि तथा खानपान तालिका नेपालका सबै जिल्लाहरूमा कुरियरमार्फत सुरक्षित पठाइन्छ।',
    order: 2
  },
  {
    id: 'faq-3',
    categoryEn: 'Treatment & Safety',
    categoryNp: 'उपचार तथा सुरक्षा',
    questionEn: 'Are Ayurvedic medicines safe to take alongside ongoing allopathic prescriptions (e.g. for blood pressure or diabetes)?',
    questionNp: 'एलोप्याथिक औषधि (जस्तै रक्तचाप वा सुगर) खाइरहेका बिरामीले आयुर्वेदिक औषधि सँगै खान मिल्छ?',
    answerEn: 'Yes, when administered under qualified medical supervision (BAMS doctor). We carefully evaluate all concurrent medications to avoid drug-herb interactions. We advise keeping a 45-minute interval between allopathic and herbal medicines, and monitor metabolic parameters regularly.',
    answerNp: 'योग्य चिकित्सक (BAMS डाक्टर) को सल्लाहमा खान मिल्छ। हामी बिरामीको वर्तमान औषधिको पूर्ण विवरण हेरेर कुनै नकारात्मक अन्तरक्रिया नहुने गरी मात्र औषधि सिफारिस गर्छौं। सामान्यतया एलोप्याथिक र आयुर्वेदिक औषधिबीच कम्तीमा ४५ मिनेटको फरक राख्न सुझाव दिइन्छ।',
    order: 3
  },
  {
    id: 'faq-4',
    categoryEn: 'Ayurvedic Principles',
    categoryNp: 'आयुर्वेद सिद्धान्त',
    questionEn: 'What is Prakriti Pariksha (Body Constitution Assessment) and why is it important?',
    questionNp: 'प्रकृति परीक्षा भनेको के हो र यो किन महत्वपूर्ण छ?',
    answerEn: 'In Ayurveda, each human being possesses a unique biological constitution defined by the three Doshas (Vata, Pitta, Kapha). Identifying your Prakriti allows us to diagnose the root cause of ailments and formulate precise personalized diets, herbs, and daily routines that prevent recurrence.',
    answerNp: 'आयुर्वेद अनुसार हरेक व्यक्तिको शारीरिक र मानसिक बनावट वात, पित्त र कफ दोषको विशिष्ट सन्तुलनमा आधारित हुन्छ। आफ्नो शरीरको प्रकृति पहिचान गर्नाले कुन खानेकुरा फाइदाजनक र कुन हानिकारक छ भन्ने थाहा हुन्छ, जसले रोगलाई पुनः दोहोरिन दिँदैन।',
    order: 4
  },
  {
    id: 'faq-5',
    categoryEn: 'Clinic Hours',
    categoryNp: 'क्लिनिक समय',
    questionEn: 'What are the clinic timings and consultation fee structures?',
    questionNp: 'क्लिनिक खुल्ने समय र परामर्श शुल्क कति छ?',
    answerEn: 'Clinic hours are Sunday through Friday, 9:00 AM to 6:00 PM (Nepal Time). Saturdays are reserved for prior tele-consultations and outreach medical camps. For consultation rates and specialized Panchakarma packages, please contact our desk.',
    answerNp: 'क्लिनिक आइतबारदेखि शुक्रबारसम्म बिहान ९:०० बजेदेखि साँझ ६:०० बजेसम्म (नेपाल समय) खुल्छ। शनिबार विशेष अनलाइन परामर्श र ग्रामीण स्वास्थ्य शिविरका लागि छुट्याइएको छ। शुल्क तथा उपचार प्याकेजका लागि फाराममार्फत सम्पर्क गर्न सक्नुहुन्छ।',
    order: 5
  }
];

export const initialSocialLinks = {
  facebook: 'https://facebook.com/drpremrajjoshi',
  instagram: 'https://instagram.com/drpremrajjoshi',
  tiktok: 'https://tiktok.com/@drpremrajjoshi',
  twitter: 'https://twitter.com/drpremrajjoshi',
  youtube: 'https://youtube.com/@drpremrajjoshi',
  whatsapp: 'https://wa.me/9779848721200'
};

export const initialUsefulLinks: UsefulLink[] = [
  {
    id: 'link-1',
    titleEn: 'Department of Ayurveda and Alternative Medicine (DoAAM), Nepal',
    titleNp: 'आयुर्वेद तथा वैकल्पिक चिकित्सा विभाग, स्वास्थ्य मन्त्रालय, नेपाल',
    url: 'https://doaa.gov.np/',
    categoryEn: 'Government & Regulators',
    categoryNp: 'सरकारी तथा नियामक निकाय'
  },
  {
    id: 'link-2',
    titleEn: 'Institute of Medicine (IOM), Tribhuvan University',
    titleNp: 'चिकित्सा शास्त्र अध्ययन संस्थान (IOM), त्रिभुवन विश्वविद्यालय',
    url: 'https://iom.edu.np/',
    categoryEn: 'Academic & Research',
    categoryNp: 'शैक्षिक तथा अनुसन्धान'
  },
  {
    id: 'link-3',
    titleEn: 'Nepal Medical Council (NMC)',
    titleNp: 'नेपाल मेडिकल काउन्सिल (एनएमसी)',
    url: 'https://nmc.org.np/',
    categoryEn: 'Professional Regulatory Body',
    categoryNp: 'चिकित्सकीय नियामक निकाय'
  },
  {
    id: 'link-4',
    titleEn: 'National Ayurveda Research and Training Center (NARTC), Kirtipur',
    titleNp: 'राष्ट्रिय आयुर्वेद अनुसन्धान तथा तालिम केन्द्र, कीर्तिपुर',
    url: 'https://nartc.gov.np/',
    categoryEn: 'Clinical Research',
    categoryNp: 'क्लिनिकल अनुसन्धान'
  }
];

export const initialDownloads: DownloadItem[] = [
  {
    id: 'dl-1',
    titleEn: 'Ayurvedic Daily Routine (Dinacharya) & Seasonal Diet Guide',
    titleNp: 'दैनिक स्वस्थ दिनचर्या र ऋतु अनुसारको आहार तालिका (PDF)',
    fileName: 'Ayurvedic_Dinacharya_Guide_DrPremRajJoshi.pdf',
    fileSize: '1.8 MB',
    fileUrl: '#download-guide-1',
    categoryEn: 'Patient Lifestyle Guide',
    categoryNp: 'बिरामी जीवनशैली निर्देशिका'
  },
  {
    id: 'dl-2',
    titleEn: 'Common Himalayan Herbs: Identification & Home Uses',
    titleNp: 'नेपाली घरेलु जडीबुटीको पहिचान र प्राथमिक घरेलु उपचार (PDF)',
    fileName: 'Himalayan_Herbs_Home_Remedies.pdf',
    fileSize: '2.4 MB',
    fileUrl: '#download-guide-2',
    categoryEn: 'Herbal Medicine',
    categoryNp: 'जडीबुटी औषधि'
  },
  {
    id: 'dl-3',
    titleEn: 'Pre-Consultation Patient Health Questionnaire & Intake Form',
    titleNp: 'परामर्श पूर्व बिरामी स्वास्थ्य विवरण फाराम (PDF)',
    fileName: 'Patient_Intake_Form_DrJoshi.pdf',
    fileSize: '850 KB',
    fileUrl: '#download-guide-3',
    categoryEn: 'Clinical Forms',
    categoryNp: 'क्लिनिकल फाराम'
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    slug: 'clinical-pulse-diagnosis-kathmandu',
    titleEn: 'Pulse Diagnosis (Nadi Pariksha) Session at Clinic',
    titleNp: 'क्लिनिकमा बिरामीको नाडी परीक्षा गर्दै',
    type: 'photo',
    mediaUrl: '/assets/images/hero_ayurveda_clinic_1791392890876.jpg',
    captionEn: 'Nadi Pariksha reveals the subtle vibrations of Vata, Pitta, and Kapha.',
    captionNp: 'नाडीको चालबाट त्रिदोषको सन्तुलन परीक्षण गरिँदै।',
    date: '2026-09-01'
  },
  {
    id: 'gal-2',
    slug: 'free-rural-ayurveda-camp-farwest',
    titleEn: 'Free Rural Health Camp in Far-Western Nepal',
    titleNp: 'सुदूरपश्चिमको ग्रामीण भेगमा निःशुल्क स्वास्थ्य शिविर',
    type: 'photo',
    mediaUrl: '/assets/images/academic_iom_tu_1791392932848.jpg',
    captionEn: 'Providing free consultations and essential herbal supplies to over 500 local residents.',
    captionNp: '५०० भन्दा बढी स्थानीय आमाबुबा तथा बालबालिकालाई निःशुल्क औषधि वितरण।',
    date: '2026-08-14'
  },
  {
    id: 'gal-3',
    slug: 'himalayan-medicinal-plants-expedition',
    titleEn: 'Himalayan Medicinal Herbs Field Study & Identification',
    titleNp: 'हिमाली जडीबुटी पहिचान तथा अध्ययन भ्रमण',
    type: 'photo',
    mediaUrl: '/assets/images/hero_himalayan_wellness_1791392913647.jpg',
    captionEn: 'Studying wild specimens of Tulsi, Chiraito, and Ashwagandha in native habitats.',
    captionNp: 'प्राकृतिक वासस्थानमा बहुमूल्य नेपाली जडीबुटीहरूको अध्ययन।',
    date: '2026-07-22'
  },
  {
    id: 'gal-4',
    slug: 'iom-ayurveda-academic-symposium',
    titleEn: 'Institute of Medicine (IOM) Alumni Medical Conference',
    titleNp: 'त्रिवि शिक्षण अस्पताल आयुर्वेद सम्मेलन',
    type: 'photo',
    mediaUrl: '/assets/images/doctor_portrait_1791392878397.jpg',
    captionEn: 'Dr. Joshi presenting clinical insights on integrative therapies.',
    captionNp: 'अनुसन्धान पत्र तथा केस स्टडी प्रस्तुत गर्दै डा. जोशी।',
    date: '2026-06-11'
  }
];

export const initialPatientInquiries: PatientInquiry[] = [
  {
    id: 'inq-101',
    trackingId: 'PRJ-10248',
    createdAt: '2026-10-06T14:20:00Z',
    fullName: 'Ramesh Bahadur Thapa',
    age: '42',
    gender: 'Male',
    phone: '+977-9851023456',
    email: 'ramesh.thapa@gmail.com',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    wardNo: '3',
    toleName: 'Maharajgunj Chakrapath',
    requestType: 'Appointment',
    problemDetails: 'Suffering from chronic acidity, sour belching and burning chest for 2 years. Allopathic antacids give only temporary relief. Seeking Ayurvedic root-cause treatment.',
    preferredDate: '2026-10-10, Morning 10:00 AM',
    status: 'In Review',
    doctorNotes: 'Classic symptoms of Amlapitta with Pitta-Kapha aggravation. Advised to bring previous endoscopy reports.',
    prescribedAdvice: 'Amalaki Churna with warm water before meals. Avoid sour fruits and oily spicy dishes.',
    messages: [
      {
        id: 'msg-1',
        sender: 'doctor',
        senderName: "Dr. Prem Raj Joshi's Clinical Team",
        message: 'Namaste Ramesh ji. Your symptoms indicate chronic Amlapitta. Please avoid citrus and fermented items until your appointment.',
        timestamp: '2026-10-06T16:30:00Z'
      }
    ],
    patientReview: {
      rating: 5,
      comment: 'Very polite clinic staff and quick guidance on preliminary diet.',
      createdAt: '2026-10-07T08:00:00Z'
    }
  },
  {
    id: 'inq-102',
    trackingId: 'PRJ-10249',
    createdAt: '2026-10-05T09:15:00Z',
    fullName: 'Sita Devi Sharma',
    age: '56',
    gender: 'Female',
    phone: '+977-9841876543',
    email: 'sitasharma.np@outlook.com',
    province: 'Gandaki Province',
    district: 'Kaski',
    municipality: 'Pokhara Metropolitan',
    wardNo: '8',
    toleName: 'Srijana Chowk',
    requestType: 'Only Prescription',
    problemDetails: 'Knee joint pain (Sandhivata), morning stiffness for 30 minutes, difficulty climbing stairs. Looking for herbal oils and medicine couriered to Pokhara.',
    status: 'Confirmed',
    doctorNotes: 'Mild osteoarthritic changes. Recommended mild Janu Basti or warm Mahanarayan oil massage.',
    prescribedAdvice: 'Mahanarayan Taila local application twice daily followed by mild fomentation. Yogaraj Guggulu 1 tab BD after meals.',
    messages: [
      {
        id: 'msg-2',
        sender: 'doctor',
        senderName: "Dr. Prem Raj Joshi's Clinical Team",
        message: 'Prescription confirmed and herbal medicine parcel dispatched via courier to Pokhara branch.',
        timestamp: '2026-10-05T12:00:00Z'
      }
    ]
  },
  {
    id: 'inq-103',
    trackingId: 'PRJ-10250',
    createdAt: '2026-10-04T18:40:00Z',
    fullName: 'Bikash Kumar Chaudhary',
    age: '29',
    gender: 'Male',
    phone: '+977-9812345678',
    email: 'bikash.chy@gmail.com',
    province: 'Sudurpashchim Province',
    district: 'Kailali',
    municipality: 'Dhangadhi Sub-Metropolitan',
    wardNo: '4',
    toleName: 'Uttar Bauniya',
    requestType: 'Follow-up Consultation',
    problemDetails: 'Completed 1 month of prescribed medication for irregular digestion and low energy. Digestion has improved significantly, need next month routine.',
    status: 'Completed',
    doctorNotes: 'Agni is normalizing. Bowel frequency regularized to once daily without straining.',
    prescribedAdvice: 'Continue Trikatu Churna with honey in morning. Maintain regular 8:00 PM dinner.',
    patientReview: {
      rating: 5,
      comment: 'My chronic digestive distress was resolved within 3 weeks of natural regimen. Grateful to Dr. Joshi!',
      createdAt: '2026-10-05T10:00:00Z'
    }
  }
];
