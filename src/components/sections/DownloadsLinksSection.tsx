import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DownloadItem } from '../../types';
import { FileText, Download, CheckCircle, Eye, X, ExternalLink, Printer } from 'lucide-react';

interface DownloadsLinksSectionProps {
  downloads: DownloadItem[];
}

export const DownloadsLinksSection: React.FC<DownloadsLinksSectionProps> = ({ downloads }) => {
  const { language } = useLanguage();
  const [viewingItem, setViewingItem] = useState<DownloadItem | null>(null);
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);

  const isRealUploadedPdf = (url?: string) =>
    Boolean(
      url &&
        (url.startsWith('data:application/pdf') ||
          url.startsWith('blob:') ||
          url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.endsWith('.pdf'))
    );

  const buildFallbackGuideText = (item: DownloadItem) => `======================================================
DR. PREM RAJ JOSHI - BAMS (IOM, TU), NMC Reg. 1824
PATIENT HEALTH RESOURCE: ${language === 'np' ? item.titleNp : item.titleEn}
File: ${item.fileName} (${item.fileSize})
Category: ${language === 'np' ? item.categoryNp : item.categoryEn}
======================================================

Clinical Highlights & Ayurvedic Guidelines:
1. Swasthasya Swasthya Rakshanam (Preserving the health of the healthy).
2. Follow personalized biological Prakriti guidelines (Vata, Pitta, Kapha).
3. Dinacharya routines: early rising (Brahma Muhurta), warm water intake, gentle yoga, and restorative herbs.
4. Dietary guidelines (Ahara Vidhi): Eat freshly prepared warm meals; avoid contradictory food combinations (Viruddha Ahara).
5. Digestive Care: Sip warm ginger-cumin infused water for optimal Agni (digestive fire).

Consult Dr. Prem Raj Joshi:
• Kathmandu Clinic: Maharajgunj Medical Zone, Kathmandu
• Sudurpashchim Clinic: Dhangadhi, Kailali
• Phone / WhatsApp: +977-9848721200
• Official Portal: https://drpremrajjoshi.com.np`;

  // Convert data:application/pdf base64 URLs into a browser-renderable Blob URL when opened in the modal
  useEffect(() => {
    if (!viewingItem) {
      if (viewerBlobUrl) {
        URL.revokeObjectURL(viewerBlobUrl);
        setViewerBlobUrl(null);
      }
      return;
    }

    const rawUrl = viewingItem.fileUrl || '';
    if (rawUrl.startsWith('data:application/pdf')) {
      try {
        const parts = rawUrl.split(',');
        const base64 = parts[1] || '';
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        setViewerBlobUrl(objectUrl);
        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      } catch {
        setViewerBlobUrl(rawUrl);
      }
    } else if (isRealUploadedPdf(rawUrl)) {
      setViewerBlobUrl(rawUrl);
    } else {
      setViewerBlobUrl(null);
    }
  }, [viewingItem]);

  const handleDownload = (item: DownloadItem) => {
    if (
      item.fileUrl &&
      (item.fileUrl.startsWith('data:') ||
        item.fileUrl.startsWith('http') ||
        item.fileUrl.startsWith('blob:'))
    ) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || 'Dr_Joshi_Health_Guide.pdf';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const content = buildFallbackGuideText(item);
    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName || 'Patient_Health_Guide.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!downloads || downloads.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {language === 'np' ? 'निःशुल्क स्वास्थ्य सामग्री' : 'Free Patient Guides'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
            {language === 'np' ? 'आयुर्वेदिक निर्देशिका तथा पीडीएफ डाउनलोड' : 'Clinical Health Guides & PDF Downloads'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-nepali">
            {language === 'np'
              ? 'बिरामीहरूका लागि उपयोगी दैनिक आहार तालिका, दिनचर्या तथा स्वास्थ्य फारामहरू वेबसाइटमै हेर्नुहोस् वा डाउनलोड गर्नुहोस्।'
              : 'View authentic Ayurvedic routine charts, dietary guidelines, and intake forms directly on the website or download PDF copies.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-emerald-600/40 transition-all duration-200 group"
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
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'np' ? item.categoryNp : item.categoryEn}</span>
                </div>
              </div>

              {/* 2 Action Buttons: View in Website + Download PDF */}
              <div className="pt-4 mt-5 border-t border-neutral-100 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewingItem(item)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  title={`View ${item.fileName} in website`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{language === 'np' ? 'यहीँ हेर्नुहोस्' : 'View PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  title={`Download ${item.fileName}`}
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'np' ? 'डाउनलोड' : 'Download'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In-Website PDF & Document Viewer Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Top Header */}
            <div className="bg-neutral-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold font-editorial truncate">
                    {language === 'np' ? viewingItem.titleNp : viewingItem.titleEn}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-mono text-emerald-400 truncate">
                    {viewingItem.fileName} · {viewingItem.fileSize}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(viewingItem)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {language === 'np' ? 'डाउनलोड गर्नुहोस्' : 'Download PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close PDF viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content Area */}
            <div className="flex-1 bg-neutral-100 overflow-hidden flex flex-col">
              {viewerBlobUrl ? (
                <iframe
                  src={viewerBlobUrl}
                  title={viewingItem.titleEn}
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                  <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase font-bold text-emerald-700">
                          {language === 'np' ? viewingItem.categoryNp : viewingItem.categoryEn}
                        </span>
                        <h4 className="text-xl sm:text-2xl font-bold text-neutral-900 font-editorial mt-0.5">
                          {language === 'np' ? viewingItem.titleNp : viewingItem.titleEn}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-4 sm:p-5 rounded-xl border border-neutral-200">
                      {buildFallbackGuideText(viewingItem)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 bg-white border-t border-neutral-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-neutral-500 font-mono truncate">
                Dr. Prem Raj Joshi (BAMS, IOM, TU) · Patient Education Resource
              </span>
              <div className="flex items-center gap-2">
                {viewerBlobUrl && (
                  <a
                    href={viewerBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

