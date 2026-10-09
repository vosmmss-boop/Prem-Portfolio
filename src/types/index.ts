export type Language = 'en' | 'np';

export interface SocialChannelItem {
  id: string;
  platform: 'facebook' | 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'whatsapp' | 'custom';
  name: string;
  handle: string;
  url: string;
  descriptionEn: string;
  descriptionNp: string;
  active: boolean;
}

export interface YouTubeVideoItem {
  id: string;
  titleEn: string;
  titleNp?: string;
  url: string;
  kickerEn?: string;
  kickerNp?: string;
}

export interface SitePopupNotice {
  active: boolean;
  titleEn: string;
  titleNp?: string;
  subtitleEn?: string;
  subtitleNp?: string;
  bodyEn?: string;
  bodyNp?: string;
  imageUrl?: string;
  imageSize?: 'small' | 'medium' | 'large' | 'full' | 'custom';
  customWidthPx?: number;
  customHeightPx?: number;
  imageObjectFit?: 'contain' | 'cover';
  ctaTextEn?: string;
  ctaTextNp?: string;
  ctaLink?: string;
  updatedAt?: number | string;
}

export interface Branding {
  doctorName: {
    en: string;
    np: string;
  };
  degreeTitle: {
    en: string;
    np: string;
  };
  tagline: {
    en: string;
    np: string;
  };
  logoUrl: string;
  flagUrl: string;
  nmcNumber: string;
  phone: string;
  email: string;
  currentLocation: {
    en: string;
    np: string;
  };
  permanentAddress: {
    en: string;
    np: string;
  };
  address: {
    en: string;
    np: string;
  };
  stats: {
    stat1Value: string;
    stat1LabelEn: string;
    stat1LabelNp: string;
    stat2Value: string;
    stat2LabelEn: string;
    stat2LabelNp: string;
    stat3Value: string;
    stat3LabelEn: string;
    stat3LabelNp: string;
  };
  youtubeEmbedUrl?: string;
  youtubeVideos?: YouTubeVideoItem[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
  socialChannels?: SocialChannelItem[];
  popupNotice?: SitePopupNotice;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  ctaTextEn: string;
  ctaTextNp: string;
  ctaLink: string;
  order: number;
}

export interface Autobiography {
  kickerEn: string;
  kickerNp: string;
  summaryEn: string;
  summaryNp: string;
  fullBioEn: string;
  fullBioNp: string;
  philosophyEn: string;
  philosophyNp: string;
  specialties: {
    en: string[];
    np: string[];
  };
  avatarUrl: string;
}

export interface EducationMilestone {
  id: string;
  slug: string;
  degreeEn: string;
  degreeNp: string;
  institutionEn: string;
  institutionNp: string;
  year: string;
  descriptionEn: string;
  descriptionNp: string;
  honorsEn?: string;
  honorsNp?: string;
  imageUrl?: string;
}

export interface ExperienceEntry {
  id: string;
  slug: string;
  roleEn: string;
  roleNp: string;
  organizationEn: string;
  organizationNp: string;
  period: string;
  locationEn: string;
  locationNp: string;
  descriptionEn: string;
  descriptionNp: string;
  achievementsEn?: string[];
  achievementsNp?: string[];
  imageUrl?: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  titleEn: string;
  titleNp: string;
  excerptEn: string;
  excerptNp: string;
  contentEn: string;
  contentNp: string;
  categoryEn: string;
  categoryNp: string;
  authorEn: string;
  authorNp: string;
  publishDate: string;
  readTime: string;
  coverImage: string;
  cover_image?: string;
  metaKeywords?: string;
  metaDescriptionEn?: string;
  metaDescriptionNp?: string;
  views?: number;
}

export interface FAQItem {
  id: string;
  categoryEn: string;
  categoryNp: string;
  questionEn: string;
  questionNp: string;
  answerEn: string;
  answerNp: string;
  order: number;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;
  whatsapp: string;
}

export interface UsefulLink {
  id: string;
  titleEn: string;
  titleNp: string;
  url: string;
  categoryEn: string;
  categoryNp: string;
  descriptionEn?: string;
  descriptionNp?: string;
}

export interface DownloadItem {
  id: string;
  titleEn: string;
  titleNp: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  categoryEn: string;
  categoryNp: string;
}

export interface GalleryItem {
  id: string;
  slug: string;
  titleEn: string;
  titleNp: string;
  type: 'photo' | 'video';
  mediaUrl: string;
  captionEn?: string;
  captionNp?: string;
  date?: string;
}

export type InquiryStatus = 'Pending' | 'In Review' | 'Confirmed' | 'Completed' | 'Cancelled';
export type InquiryType = 'Appointment' | 'Only Prescription' | 'Follow-up Consultation';

export interface InquiryAttachment {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface InquiryMessage {
  id: string;
  sender: 'doctor' | 'patient';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface PatientReview {
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface PatientInquiry {
  id: string;
  trackingId?: string; // e.g. "PRJ-842109"
  createdAt: string;
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  toleName: string;
  requestType: InquiryType;
  problemDetails: string;
  preferredDate?: string;
  status: InquiryStatus;
  doctorNotes?: string;
  prescribedAdvice?: string;
  attachment?: InquiryAttachment;
  messages?: InquiryMessage[];
  patientReview?: PatientReview;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  textAlign: 'left' | 'justify';
  colorFilter: 'none' | 'grayscale' | 'warm';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  dyslexiaFont: boolean;
  largeCursor: boolean;
}

