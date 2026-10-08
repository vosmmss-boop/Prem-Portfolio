import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DownloadItem } from '../../types';
import { FileText, Download, CheckCircle } from 'lucide-react';

interface DownloadsLinksSectionProps {
  downloads: DownloadItem[];
}

export const DownloadsLinksSection: React.FC<DownloadsLinksSectionProps> = ({ downloads }) => {
  const { language, t } = useLanguage();

  const handleDownload = (item: DownloadItem) => {
    // If it's a real base64 data URL or external URL uploaded via CMS
    if (item.fileUrl && (item.fileUrl.startsWith('data:') || item.fileUrl.startsWith('http') || item.fileUrl.startsWith('blob:'))) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || 'Dr_Joshi_Health_Guide.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Otherwise generate standard PDF document text summary
    const content = `======================================================
DR. PREM RAJ JOSHI - BAMS (IOM, TU), NMC Reg. 1824
PATIENT HEALTH RESOURCE: ${language === 'np' ? item.titleNp : item.titleEn}
File: ${item.fileName} (${item.fileSize})
======================================================

Clinical Highlights:
1. Swasthasya Swasthya Rakshanam (Preserving the health of the healthy).
2. Follow personalized biological Prakriti guidelines (Vata, Pitta, Kapha).
3. Dinacharya routines: early rising, copper-vessel water, gentle yoga, and restorative herbs.
4. Dietary guidelines: Avoid contradictory food combinations (Viruddha Ahara).

Consult Dr. Prem Raj Joshi:
• Kathmandu Clinic: Maharajgunj Medical Zone, Kathmandu
• Sudurpashchim Clinic: Dhangadhi, Kailali
• Official Portal: https://drpremrajjoshi.com.np`;

    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!downloads || downloads.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {language === 'np' ? 'निःशुल्क स्वास्थ्य सामग्री' : 'Free Patient Guides'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
            {language === 'np' ? 'आयुर्वेदिक निर्देशिका तथा पीडीएफ डाउनलोड' : 'Clinical Health Guides & PDF Downloads'}
          </h2>
          <p className="text-sm text-neutral-600 mt-2 font-nepali">
            {language === 'np'
              ? 'बिरामीहरूका लागि उपयोगी दैनिक आहार तालिका, दिनचर्या तथा स्वास्थ्य फारामहरू यहाँबाट सजिलै डाउनलोड गर्नुहोस्।'
              : 'Easily download authentic Ayurvedic routine charts, dietary guidelines, and consultation intake forms.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-emerald-600/40 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                    {item.fileSize}
                  </span>
                </div>

                <h3 className="font-bold text-base text-neutral-900 group-hover:text-emerald-800 transition-colors font-editorial leading-snug mb-1">
                  {language === 'np' ? item.titleNp : item.titleEn}
                </h3>

                <p className="text-xs font-mono text-neutral-400 mb-3 line-clamp-1">
                  {item.fileName}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'np' ? item.categoryNp : item.categoryEn}</span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Verified PDF
                </span>

                <button
                  onClick={() => handleDownload(item)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  title={`Download ${item.fileName}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'np' ? 'डाउनलोड गर्नुहोस्' : 'Download PDF'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
