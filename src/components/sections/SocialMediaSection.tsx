import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { initialSocialLinks } from '../../data/initialData';
import {
  Share2,
  ExternalLink,
  MessageCircle,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Music
} from 'lucide-react';

interface SocialMediaSectionProps {
  socialLinks?: typeof initialSocialLinks;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  socialLinks = initialSocialLinks
}) => {
  const { language, t } = useLanguage();

  const channels = [
    {
      name: 'Facebook Page',
      handle: '@drpremrajjoshi',
      icon: Facebook,
      url: socialLinks.facebook,
      color: 'hover:text-blue-600 hover:border-blue-300',
      descriptionEn: 'Daily health columns, live Q&A, and community medical advisories.',
      descriptionNp: 'दैनिक स्वास्थ्य सल्लाह, लाइभ प्रश्नोत्तर तथा जनचेतनामूलक पोस्टहरू।'
    },
    {
      name: 'YouTube Channel',
      handle: 'Dr. Prem Raj Joshi',
      icon: Youtube,
      url: socialLinks.youtube,
      color: 'hover:text-red-600 hover:border-red-300',
      descriptionEn: 'In-depth video lectures on Dinacharya, herbal medicines, and disease care.',
      descriptionNp: 'रोग निदान, जडीबुटीको पहिचान र घरेलु उपचार सम्बन्धी भिडियोहरू।'
    },
    {
      name: 'Instagram',
      handle: '@drpremrajjoshi',
      icon: Instagram,
      url: socialLinks.instagram,
      color: 'hover:text-pink-600 hover:border-pink-300',
      descriptionEn: 'Visual infographics on Ayurvedic diet, medicinal herbs, and lifestyle.',
      descriptionNp: 'आयुर्वेदिक खानपान र जडीबुटी सम्बन्धी जानकारीमूलक फोटो र रिल्स।'
    },
    {
      name: 'TikTok',
      handle: '@drpremrajjoshi',
      icon: Music,
      url: socialLinks.tiktok,
      color: 'hover:text-neutral-900 hover:border-neutral-400',
      descriptionEn: 'Short 60-second health tips, myths vs. facts in Nepali language.',
      descriptionNp: 'एक मिनेटका छरिता स्वास्थ्य टिप्स र भ्रम निवारण भिडियोहरू।'
    },
    {
      name: 'X (Twitter)',
      handle: '@drpremrajjoshi',
      icon: Twitter,
      url: socialLinks.twitter,
      color: 'hover:text-sky-500 hover:border-sky-300',
      descriptionEn: 'Public health opinions, medical policy reflections, and research tweets.',
      descriptionNp: 'जनस्वास्थ्य, चिकित्सा नीति र अनुसन्धान सम्बन्धी संक्षिप्त विचारहरू।'
    },
    {
      name: 'Direct WhatsApp',
      handle: '+977-9848721200',
      icon: MessageCircle,
      url: socialLinks.whatsapp,
      color: 'hover:text-emerald-600 hover:border-emerald-300',
      descriptionEn: 'Direct clinic desk for appointment verification and prescription coordination.',
      descriptionNp: 'अपोइन्टमेन्ट तथा औषधि डेलिभरी समन्वयका लागि प्रत्यक्ष च्याट।'
    }
  ];

  return (
    <section id="socialmedia" className="py-20 md:py-28 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {t('sec_social_kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
            {t('sec_social_title')}
          </h2>
          <p className="text-sm text-neutral-600 mt-2 font-nepali">
            {t('sec_social_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((chan) => {
            const Icon = chan.icon;
            return (
              <a
                key={chan.name}
                href={chan.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-white border border-neutral-200/90 rounded-2xl p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between group ${chan.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-50 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-neutral-400 group-hover:text-neutral-800 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 mb-0.5">
                    {chan.name}
                  </h3>

                  <span className="text-xs font-mono text-emerald-700 font-medium block mb-2">
                    {chan.handle}
                  </span>

                  <p className="text-xs text-neutral-600 leading-relaxed font-nepali">
                    {language === 'np' ? chan.descriptionNp : chan.descriptionEn}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-500 group-hover:text-neutral-900">
                  <span>Connect</span>
                  <span>→</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
