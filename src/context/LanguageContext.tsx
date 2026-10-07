import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; np: string }> = {
  // Navigation
  nav_home: { en: 'Home', np: 'गृहपृष्ठ' },
  nav_about: { en: 'About Me', np: 'मेरो बारेमा' },
  nav_journey: { en: 'Education Journey', np: 'शैक्षिक यात्रा' },
  nav_experience: { en: 'Experience', np: 'अनुभव' },
  nav_social: { en: 'Social Media', np: 'सञ्जाल' },
  nav_gallery: { en: 'Gallery', np: 'तस्बिरहरू' },
  nav_blogs: { en: 'Health Blogs', np: 'स्वास्थ्य लेखहरू' },
  nav_faq: { en: 'FAQs', np: 'प्राय सोधिने प्रश्न' },
  nav_appointment: { en: 'Book Consultation', np: 'परामर्श लिनुहोस्' },
  nav_admin_portal: { en: 'CMS Admin', np: 'व्यवस्थापक पोर्टल' },
  nav_inquiries_portal: { en: 'Inquiries Portal', np: 'बिरामी सोधपुछ' },

  // Live Clock & Header
  live_time_label: { en: 'Live Nepal Time (NPT)', np: 'प्रत्यक्ष नेपाल समय (NPT)' },
  dr_title: { en: 'Dr. Prem Raj Joshi', np: 'डा. प्रेम राज जोशी' },
  dr_credentials: { en: 'BAMS (IOM, TU) · Ayurvedic Physician', np: 'बीएएमएस (आईओएम, त्रिवि) · आयुर्वेदिक चिकित्सक' },

  // Namaste Floating Widget
  namaste_badge_text: {
    en: 'Namaste! How can I help you?',
    np: 'नमस्ते! म हजुरलाई कसरी सहयोग गर्न सक्छु?'
  },
  namaste_modal_title: {
    en: 'Request Consultation & Prescription',
    np: 'स्वास्थ्य परामर्श तथा औषधि सोधपुछ'
  },
  namaste_modal_subtitle: {
    en: 'Connect directly with Dr. Prem Raj Joshi for personalized Ayurvedic care.',
    np: 'प्राकृतिक उपचार तथा स्वास्थ्य परामर्शका लागि आफ्नो विवरण भर्नुहोस्।'
  },
  form_full_name: { en: 'Full Name', np: 'पूरा नाम' },
  form_full_name_ph: { en: 'e.g. Ramesh Bahadur Thapa', np: 'जस्तै: रमेश बहादुर थापा' },
  form_age: { en: 'Age', np: 'उमेर' },
  form_gender: { en: 'Gender', np: 'लिङ्ग' },
  form_gender_male: { en: 'Male', np: 'पुरुष' },
  form_gender_female: { en: 'Female', np: 'महिला' },
  form_gender_other: { en: 'Other', np: 'अन्य' },
  form_phone: { en: 'Phone / WhatsApp Number', np: 'फोन / ह्वाट्सएप नम्बर' },
  form_province: { en: 'Province', np: 'प्रदेश' },
  form_district: { en: 'District', np: 'जिल्ला' },
  form_district_ph: { en: 'e.g. Kathmandu / Kailali', np: 'जस्तै: काठमाडौं / कैलाली' },
  form_municipality: { en: 'Municipality / Rural Mun.', np: 'नगरपालिका / गाउँपालिका' },
  form_municipality_ph: { en: 'e.g. Kathmandu Metropolitan', np: 'जस्तै: काठमाडौं महानगरपालिका' },
  form_ward: { en: 'Ward No.', np: 'वडा नं.' },
  form_tole: { en: 'Tole / Village Name', np: 'टोल / बस्तीको नाम' },
  form_request_type: { en: 'Request Type', np: 'सोधपुछको प्रकार' },
  form_type_appointment: { en: 'Doctor Consultation & Appointment', np: 'चिकित्सक परामर्श तथा अपोइन्टमेन्ट' },
  form_type_prescription: { en: 'Only Prescription / Medicine Delivery', np: 'औषधि सिफारिस तथा डेलिभरी मात्र' },
  form_type_followup: { en: 'Follow-up Consultation', np: 'फलो-अप परामर्श' },
  form_problems: { en: 'Health Symptoms & Disease Details', np: 'स्वास्थ्य समस्या तथा लक्षणहरूको विवरण' },
  form_problems_ph: {
    en: 'Please detail your current symptoms, duration, previous medications, and specific questions...',
    np: 'समस्या कहिलेदेखि सुरु भयो, कस्ता लक्षण छन् र पहिले के औषधि खानुभएको थियो, खुलाउनुहोस्...'
  },
  form_submit_btn: { en: 'Submit Patient Inquiry', np: 'सोधपुछ फाराम पेश गर्नुहोस्' },
  form_whatsapp_btn: { en: 'Send via WhatsApp', np: 'ह्वाट्सएपमा पठाउनुहोस्' },
  form_submitting: { en: 'Saving Record...', np: 'सुरक्षित गर्दै...' },
  form_success_title: { en: 'Inquiry Submitted Successfully!', np: 'फाराम सफलतापूर्वक पेश भयो!' },
  form_success_desc: {
    en: 'Thank you. Dr. Prem Raj Joshi will review your details and reach out shortly.',
    np: 'धन्यवाद। डा. प्रेम राज जोशीले तपाईंको विवरण अध्ययन गरी चाँडै सम्पर्क गर्नुहुनेछ।'
  },

  // Sections
  sec_about_kicker: { en: 'About Me', np: 'मेरो बारेमा' },
  sec_about_title: { en: 'Holistic Healing with Classical Rigor', np: 'शास्त्रीय निष्ठा र समग्र प्राकृतिक उपचार' },
  sec_about_btn: { en: 'Read Detailed Autobiography', np: 'विस्तृत जीवनी पढ्नुहोस्' },
  sec_specialties_title: { en: 'Clinical Focus Areas', np: 'विशेष क्लिनिकल दक्षता क्षेत्र' },

  sec_journey_kicker: { en: 'Academic Milestones', np: 'शैक्षिक पृष्ठभूमि' },
  sec_journey_title: { en: 'Educational Journey & Medical Training', np: 'शैक्षिक यात्रा तथा चिकित्सा अध्ययन' },

  sec_experience_kicker: { en: 'Clinical Engagements', np: 'क्लिनिकल अनुभव' },
  sec_experience_title: { en: 'Hospital Practice & Public Health Outreach', np: 'अस्पताल सेवा तथा स्वास्थ्य शिविर' },

  sec_social_kicker: { en: 'Stay Connected', np: 'सम्पर्कमा रहनुहोस्' },
  sec_social_title: { en: 'Official Social Media Channels', np: 'आधिकारिक सामाजिक सञ्जालहरू' },
  sec_social_subtitle: {
    en: 'Follow Dr. Joshi for daily Ayurvedic wellness tips, dietary guidance, and health updates.',
    np: 'दैनिक स्वास्थ्य टिप्स, खानपान सल्लाह र नयाँ भिडियोहरूका लागि जोडिनुहोस्।'
  },

  sec_gallery_kicker: { en: 'Visual Archive', np: 'तस्बिर तथा भिडियो' },
  sec_gallery_title: { en: 'Clinical Moments, Herbal Expeditions & Health Camps', np: 'क्लिनिक, जडीबुटी अध्ययन तथा स्वास्थ्य शिविर' },

  sec_blogs_kicker: { en: 'Evidence-Based Wellness', np: 'स्वास्थ्य सल्लाह' },
  sec_blogs_title: { en: 'Health Articles & Ayurvedic Insights', np: 'स्वास्थ्य लेख तथा वैज्ञानिक अनुसन्धान' },
  sec_blogs_search_ph: { en: 'Search health articles by keyword...', np: 'शीर्षक वा विषय अनुसार लेख खोज्नुहोस्...' },
  sec_blogs_read_more: { en: 'Read Full Article', np: 'पूरा लेख पढ्नुहोस्' },

  sec_faq_kicker: { en: 'Patient Guidance', np: 'सामान्य जिज्ञासा' },
  sec_faq_title: { en: 'Frequently Asked Questions', np: 'प्राय सोधिने प्रश्नहरू' },
  sec_faq_search_ph: { en: 'Search questions about appointments, herbs, clinic...', np: 'अपोइन्टमेन्ट, औषधि वा क्लिनिकबारे प्रश्न खोज्नुहोस्...' },
  sec_faq_all: { en: 'All Categories', np: 'सबै वर्ग' },

  sec_downloads_kicker: { en: 'Patient Resources', np: 'उपयोगी सामग्री' },
  sec_downloads_title: { en: 'Helpful Medical Links & Free PDF Guides', np: 'महत्वपूर्ण वेबसाइट लिंक तथा निःशुल्क पीडीएफ निर्देशिका' },

  // Accessibility Panel
  access_title: { en: 'Accessibility Options', np: 'पहुँच योग्यता सुविधाहरू' },
  access_font_size: { en: 'Text Size', np: 'अक्षरको आकार' },
  access_contrast: { en: 'High Contrast', np: 'उच्च कन्ट्रास्ट' },
  access_alignment: { en: 'Text Alignment', np: 'पाठ पङ्क्तिबद्धता' },
  access_filters: { en: 'Color Filters', np: 'रङ्ग फिल्टर' },
  access_dyslexia: { en: 'Dyslexia Friendly Font', np: 'पढ्न सहज फन्ट' },
  access_cursor: { en: 'Enlarged Cursor', np: 'ठूलो कर्सर' },
  access_reset: { en: 'Reset to Default', np: 'पूर्वनिर्धारितमा फर्काउनुहोस्' },

  // Footer
  footer_disclaimer: {
    en: 'Disclaimer: The information provided on this website is for educational and advisory purposes and does not replace emergency medical diagnosis. For acute emergencies, visit the nearest medical hospital immediately.',
    np: 'सूचना: यस वेबसाइटमा प्रस्तुत सामग्री शैक्षिक तथा परामर्शका लागि हो। आकस्मिक अवस्थामा तुरुन्त नजिकको अस्पताल जानुहोला।'
  },
  footer_rights: {
    en: 'All rights reserved. Dr. Prem Raj Joshi (BAMS, IOM, TU).',
    np: 'सर्वाधिकार सुरक्षित। डा. प्रेम राज जोशी (बीएएमएस, आईओएम, त्रिवि)।'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('dr_joshi_lang');
      if (saved === 'en' || saved === 'np') return saved;
    } catch (e) {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('dr_joshi_lang', lang);
    } catch (e) {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'np' : 'en');
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
