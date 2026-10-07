import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FAQItem } from '../../types';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQItem[];
  isLoading: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs, isLoading }) => {
  const { language, t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(faqs.map((f) => f.categoryEn)));

  const filteredFaqs = faqs.filter((faq) => {
    const q = language === 'np' ? faq.questionNp : faq.questionEn;
    const a = language === 'np' ? faq.answerNp : faq.answerEn;
    const matchesSearch =
      q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || faq.categoryEn === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {t('sec_faq_kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
            {t('sec_faq_title')}
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Clear answers to common patient questions regarding consultations, Ayurvedic medications, and clinic procedures.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('sec_faq_search_ph')}
            className="w-full pl-11 pr-4 py-3 text-sm border border-neutral-300 rounded-xl bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white shadow-2xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {t('sec_faq_all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
              No frequently asked questions match your search.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-neutral-200 rounded-xl overflow-hidden transition-colors bg-white shadow-2xs"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-sm md:text-base text-neutral-900 font-editorial">
                        {language === 'np' ? faq.questionNp : faq.questionEn}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-neutral-700 leading-relaxed font-nepali border-t border-neutral-100 bg-neutral-50/30">
                      {language === 'np' ? faq.answerNp : faq.answerEn}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
