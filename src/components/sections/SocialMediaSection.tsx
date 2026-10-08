import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { initialSocialLinks } from '../../data/initialData';
import { SocialChannelItem } from '../../types';
import { RichTextContent } from '../common/RichTextContent';
import {
  Share2,
  ExternalLink,
  MessageCircle,
  Youtube,
  Instagram,
  Facebook
} from 'lucide-react';

// Official TikTok Brand SVG Icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Official X (formerly Twitter) Brand SVG Icon
const XLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialMediaSectionProps {
  socialLinks?: typeof initialSocialLinks;
  socialChannels?: SocialChannelItem[];
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  socialLinks = initialSocialLinks,
  socialChannels
}) => {
  const { language, t } = useLanguage();

  const defaultChannels = [
    {
      id: 'facebook',
      platform: 'facebook' as const,
      name: 'Facebook Page',
      handle: '@drpremrajjoshi',
      icon: Facebook,
      url: socialLinks.facebook,
      color: 'hover:text-blue-600 hover:border-blue-300',
      descriptionEn: 'Daily health columns, live Q&A, and community medical advisories.',
      descriptionNp: 'दैनिक स्वास्थ्य सल्लाह, लाइभ प्रश्नोत्तर तथा जनचेतनामूलक पोस्टहरू।',
      active: Boolean(socialLinks.facebook && socialLinks.facebook.trim())
    },
    {
      id: 'youtube',
      platform: 'youtube' as const,
      name: 'YouTube Channel',
      handle: 'Dr. Prem Raj Joshi',
      icon: Youtube,
      url: socialLinks.youtube,
      color: 'hover:text-red-600 hover:border-red-300',
      descriptionEn: 'In-depth video lectures on Dinacharya, herbal medicines, and disease care.',
      descriptionNp: 'रोग निदान, जडीबुटीको पहिचान र घरेलु उपचार सम्बन्धी भिडियोहरू।',
      active: Boolean(socialLinks.youtube && socialLinks.youtube.trim())
    },
    {
      id: 'instagram',
      platform: 'instagram' as const,
      name: 'Instagram',
      handle: '@drpremrajjoshi',
      icon: Instagram,
      url: socialLinks.instagram,
      color: 'hover:text-pink-600 hover:border-pink-300',
      descriptionEn: 'Visual infographics on Ayurvedic diet, medicinal herbs, and lifestyle.',
      descriptionNp: 'आयुर्वेदिक खानपान र जडीबुटी सम्बन्धी जानकारीमूलक फोटो र रिल्स।',
      active: Boolean(socialLinks.instagram && socialLinks.instagram.trim())
    },
    {
      id: 'tiktok',
      platform: 'tiktok' as const,
      name: 'TikTok',
      handle: '@drpremrajjoshi',
      icon: TikTokIcon,
      url: socialLinks.tiktok,
      color: 'hover:text-neutral-950 hover:border-neutral-400',
      descriptionEn: 'Short 60-second health tips, myths vs. facts in Nepali language.',
      descriptionNp: 'एक मिनेटका छरिता स्वास्थ्य टिप्स र भ्रम निवारण भिडियोहरू।',
      active: Boolean(socialLinks.tiktok && socialLinks.tiktok.trim())
    },
    {
      id: 'twitter',
      platform: 'twitter' as const,
      name: 'X (Twitter)',
      handle: '@drpremrajjoshi',
      icon: XLogoIcon,
      url: socialLinks.twitter,
      color: 'hover:text-neutral-950 hover:border-neutral-400',
      descriptionEn: 'Public health opinions, medical policy reflections, and research tweets.',
      descriptionNp: 'जनस्वास्थ्य, चिकित्सा नीति र अनुसन्धान सम्बन्धी संक्षिप्त विचारहरू।',
      active: Boolean(socialLinks.twitter && socialLinks.twitter.trim())
    },
    {
      id: 'whatsapp',
      platform: 'whatsapp' as const,
      name: 'Direct WhatsApp',
      handle: '+977-9848721200',
      icon: MessageCircle,
      url: socialLinks.whatsapp,
      color: 'hover:text-emerald-600 hover:border-emerald-300',
      descriptionEn: 'Direct clinic desk for appointment verification and prescription coordination.',
      descriptionNp: 'अपोइन्टमेन्ट तथा औषधि डेलिभरी समन्वयका लागि प्रत्यक्ष च्याट।',
      active: Boolean(socialLinks.whatsapp && socialLinks.whatsapp.trim())
    }
  ];

  const getIconAndColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return { icon: Facebook, color: 'hover:text-blue-600 hover:border-blue-300' };
      case 'youtube':
        return { icon: Youtube, color: 'hover:text-red-600 hover:border-red-300' };
      case 'instagram':
        return { icon: Instagram, color: 'hover:text-pink-600 hover:border-pink-300' };
      case 'tiktok':
        return { icon: TikTokIcon, color: 'hover:text-neutral-950 hover:border-neutral-400' };
      case 'twitter':
        return { icon: XLogoIcon, color: 'hover:text-neutral-950 hover:border-neutral-400' };
      case 'whatsapp':
        return { icon: MessageCircle, color: 'hover:text-emerald-600 hover:border-emerald-300' };
      default:
        return { icon: Share2, color: 'hover:text-emerald-600 hover:border-emerald-300' };
    }
  };

  const resolvedChannels =
    socialChannels && socialChannels.length > 0
      ? socialChannels.map((c) => {
          const meta = getIconAndColor(c.platform);
          return {
            ...c,
            icon: meta.icon,
            color: meta.color
          };
        })
      : defaultChannels;

  const activeChannels = resolvedChannels.filter(
    (c) => c.active !== false && Boolean(c.url && c.url.trim())
  );

  if (activeChannels.length === 0) {
    return null;
  }

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
          {activeChannels.map((chan) => {
            const Icon = chan.icon;
            return (
              <a
                key={chan.id || chan.name}
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

                  <RichTextContent
                    content={language === 'np' ? chan.descriptionNp : chan.descriptionEn}
                    className="text-xs text-neutral-600 leading-relaxed font-nepali"
                  />
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
