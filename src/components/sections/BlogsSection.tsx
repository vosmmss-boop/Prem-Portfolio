import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BlogArticle } from '../../types';
import { CardsSkeleton } from '../common/SkeletonLoaders';
import { Search, Calendar, Clock, ArrowRight, Share2, Check, X, Tag, Maximize2 } from 'lucide-react';
import { sanitizeSlug } from '../../utils/slugify';
import { FullScreenImageViewer } from '../common/FullScreenImageViewer';

interface BlogsSectionProps {
  blogs: BlogArticle[];
  isLoading: boolean;
  onSelectBlog?: (blog: BlogArticle) => void;
  activeBlogSlug?: string | null;
  onCloseBlog?: () => void;
  doctorImage?: string;
}

export const BlogsSection: React.FC<BlogsSectionProps> = ({
  blogs,
  isLoading,
  onSelectBlog,
  activeBlogSlug,
  onCloseBlog,
  doctorImage
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBlog, setActiveBlog] = useState<BlogArticle | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<{ url: string; title?: string; subtitle?: string } | null>(null);

  // Sync active blog with incoming activeBlogSlug (from deep link or route changes)
  useEffect(() => {
    if (activeBlogSlug && blogs && blogs.length > 0) {
      const cleanTarget = sanitizeSlug(activeBlogSlug);
      const matched = blogs.find(
        (b) => sanitizeSlug(b.slug) === cleanTarget || sanitizeSlug(b.titleEn) === cleanTarget
      );
      if (matched) {
        setActiveBlog(matched);
      }
    } else if (!activeBlogSlug) {
      setActiveBlog(null);
    }
  }, [activeBlogSlug, blogs]);

  // Update dynamic document title and canonical meta tags when article is active
  useEffect(() => {
    if (activeBlog) {
      const originalTitle = document.title;
      const cleanSlug = sanitizeSlug(activeBlog.slug);
      const articleTitle = language === 'np' ? activeBlog.titleNp : activeBlog.titleEn;
      document.title = `${articleTitle} | Dr. Prem Raj Joshi - BAMS (IOM, TU)`;

      // Update Canonical link
      let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      const originalCanonical = canonicalLink ? canonicalLink.href : 'https://drpremrajjoshi.com.np/';
      if (canonicalLink) {
        canonicalLink.href = `${window.location.origin}/blog/${cleanSlug}`;
      }

      // Update Open Graph URL
      const ogUrl = document.querySelector("meta[property='og:url']") as HTMLMetaElement | null;
      if (ogUrl) ogUrl.content = `${window.location.origin}/blog/${cleanSlug}`;

      return () => {
        document.title = originalTitle;
        if (canonicalLink) canonicalLink.href = originalCanonical;
        if (ogUrl) ogUrl.content = originalCanonical;
      };
    }
  }, [activeBlog, language]);

  const handleOpenBlog = (blog: BlogArticle) => {
    const cleanSlug = sanitizeSlug(blog.slug);
    setActiveBlog(blog);
    window.history.pushState(null, '', `/blog/${cleanSlug}`);
    if (onSelectBlog) onSelectBlog(blog);
  };

  const handleCloseModal = () => {
    setActiveBlog(null);
    if (onCloseBlog) {
      onCloseBlog();
    } else {
      window.history.pushState(null, '', '/#blogs');
    }
  };

  const handleCopyShareLink = (slug: string) => {
    const cleanSlug = sanitizeSlug(slug);
    const shareUrl = `${window.location.origin}/blog/${cleanSlug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter categories
  const categoriesEn = Array.from(new Set(blogs.map((b) => b.categoryEn)));

  const filteredBlogs = blogs.filter((blog) => {
    const title = language === 'np' ? blog.titleNp : blog.titleEn;
    const excerpt = language === 'np' ? blog.excerptNp : blog.excerptEn;
    const content = language === 'np' ? blog.contentNp : blog.contentEn;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || blog.categoryEn === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="blogs" className="py-20 md:py-28 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
              {t('sec_blogs_kicker')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
              {t('sec_blogs_title')}
            </h2>
            <p className="text-sm text-neutral-600 mt-2">
              Clinical knowledge, dietary advice, and Ayurvedic lifestyle wisdom by Dr. Prem Raj Joshi.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sec_blogs_search_ph')}
              className="w-full pl-10 pr-4 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills (Interactive Filter Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            All Articles ({blogs.length})
          </button>
          {categoriesEn.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeletons when data is loading */}
        {isLoading ? (
          <CardsSkeleton count={3} />
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8">
            <p className="text-sm text-neutral-500">No articles match your search query.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-3 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Auto-adjusting Blog Card Image with Full Screen Trigger */}
                  <div className="relative aspect-16/9 overflow-hidden bg-neutral-900 group/img">
                    {/* Blurred ambient background for non-standard ratios */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110"
                      style={{ backgroundImage: `url(${blog.cover_image || blog.coverImage})` }}
                    />
                    <img
                      src={blog.cover_image || blog.coverImage}
                      alt={language === 'np' ? blog.titleNp : blog.titleEn}
                      className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 z-20 bg-neutral-900/80 backdrop-blur-md text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {language === 'np' ? blog.categoryNp : blog.categoryEn}
                    </div>

                    {/* Quick Full Screen Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFullScreenImage({
                          url: blog.cover_image || blog.coverImage,
                          title: language === 'np' ? blog.titleNp : blog.titleEn,
                          subtitle: `${blog.categoryEn} · ${blog.publishDate}`
                        });
                      }}
                      className="absolute top-3 right-3 z-20 p-1.5 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Metadata with dot separators */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                      <span>{blog.publishDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {blog.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-emerald-800 transition-colors font-editorial leading-snug mb-3">
                      <a
                        href={`/blog/${sanitizeSlug(blog.slug)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenBlog(blog);
                        }}
                      >
                        {language === 'np' ? blog.titleNp : blog.titleEn}
                      </a>
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed font-nepali">
                      {language === 'np' ? blog.excerptNp : blog.excerptEn}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <a
                    href={`/blog/${sanitizeSlug(blog.slug)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenBlog(blog);
                    }}
                    className="text-[11px] font-mono text-neutral-400 hover:text-emerald-700 transition-colors"
                  >
                    /blog/{sanitizeSlug(blog.slug)}
                  </a>

                  <a
                    href={`/blog/${sanitizeSlug(blog.slug)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenBlog(blog);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>{t('sec_blogs_read_more')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Article Reading Modal (Handles Direct Slug Deep-Linking, Loading & Not-Found states gracefully) */}
      {(activeBlog || activeBlogSlug) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="bg-neutral-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 truncate max-w-[65%]">
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">/blog/{activeBlog ? sanitizeSlug(activeBlog.slug) : sanitizeSlug(activeBlogSlug || '')}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeBlog && (
                  <button
                    onClick={() => handleCopyShareLink(activeBlog.slug)}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy share link with OG meta tags"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  aria-label="Close article"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {activeBlog ? (
              <div className="p-5 sm:p-8 md:p-10 overflow-y-auto space-y-6">
                {/* Auto-Adjusting Cover Image with Full Screen Trigger */}
                <div
                  className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-200 group cursor-pointer shadow-md min-h-[240px] max-h-[500px] flex items-center justify-center"
                  onClick={() =>
                    setFullScreenImage({
                      url: activeBlog.cover_image || activeBlog.coverImage,
                      title: language === 'np' ? activeBlog.titleNp : activeBlog.titleEn,
                      subtitle: `${activeBlog.categoryEn} · ${activeBlog.publishDate}`
                    })
                  }
                >
                  {/* Blurred backdrop automatically filling empty space for any aspect ratio */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-110"
                    style={{ backgroundImage: `url(${activeBlog.cover_image || activeBlog.coverImage})` }}
                  />

                  {/* Clean uncropped auto-adjusted image */}
                  <img
                    src={activeBlog.cover_image || activeBlog.coverImage}
                    alt={language === 'np' ? activeBlog.titleNp : activeBlog.titleEn}
                    className="relative z-10 max-h-[480px] w-auto max-w-full object-contain mx-auto shadow-md rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                  />

                  {/* Full Screen Badge Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullScreenImage({
                        url: activeBlog.cover_image || activeBlog.coverImage,
                        title: language === 'np' ? activeBlog.titleNp : activeBlog.titleEn,
                        subtitle: `${activeBlog.categoryEn} · ${activeBlog.publishDate}`
                      });
                    }}
                    className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-md text-white text-xs font-semibold rounded-xl border border-neutral-700/60 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Full Screen</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                    <span className="font-semibold text-emerald-700">
                      {language === 'np' ? activeBlog.categoryNp : activeBlog.categoryEn}
                    </span>
                    <span>·</span>
                    <span>{activeBlog.publishDate}</span>
                    <span>·</span>
                    <span>{activeBlog.readTime}</span>
                    <span>·</span>
                    <span>By {language === 'np' ? activeBlog.authorNp : activeBlog.authorEn}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-950 font-editorial leading-tight">
                    {language === 'np' ? activeBlog.titleNp : activeBlog.titleEn}
                  </h1>
                </div>

                {/* Formatted Article Body */}
                <div className="text-base text-neutral-800 leading-relaxed font-nepali space-y-4 whitespace-pre-line border-t border-neutral-200 pt-6">
                  {language === 'np' ? activeBlog.contentNp : activeBlog.contentEn}
                </div>

                {/* Author signature footer - Synchronized profile picture */}
                <div className="mt-8 pt-6 border-t border-neutral-200 bg-emerald-50/50 p-5 rounded-2xl flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-white shadow-xs cursor-pointer group/doc"
                    onClick={() =>
                      setFullScreenImage({
                        url: doctorImage || "/src/assets/images/doctor_portrait_1791392878397.jpg",
                        title: "Dr. Prem Raj Joshi (BAMS, IOM, TU)",
                        subtitle: "NMC Reg. 1824 · Ayurvedic Physician"
                      })
                    }
                    title="Click to view portrait in full screen"
                  >
                    <img
                      src={doctorImage || "/src/assets/images/doctor_portrait_1791392878397.jpg"}
                      alt="Dr. Prem Raj Joshi"
                      className="w-full h-full object-cover group-hover/doc:scale-110 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm font-editorial">
                      Dr. Prem Raj Joshi (BAMS, IOM, TU)
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Ayurvedic Physician · NMC Reg. 1824 · Consultations available at Kathmandu Clinic and online tele-health.
                    </p>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              /* Loading Article Skeleton */
              <div className="p-8 space-y-6">
                <div className="h-64 bg-neutral-200 animate-pulse rounded-2xl w-full" />
                <div className="h-8 bg-neutral-200 animate-pulse rounded-md w-3/4" />
                <div className="space-y-3 pt-4">
                  <div className="h-4 bg-neutral-200 animate-pulse rounded w-full" />
                  <div className="h-4 bg-neutral-200 animate-pulse rounded w-5/6" />
                  <div className="h-4 bg-neutral-200 animate-pulse rounded w-4/6" />
                </div>
                <p className="text-xs text-center text-neutral-500 font-mono">
                  Loading medical article from database...
                </p>
              </div>
            ) : (
              /* Article Not Found */
              <div className="p-8 md:p-12 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Tag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-neutral-900 font-editorial">
                    Article Not Found or Moved
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-md mx-auto">
                    The requested blog article with slug <code className="text-emerald-700 font-bold bg-neutral-100 px-1.5 py-0.5 rounded font-mono">/blog/{activeBlogSlug}</code> could not be located. Browse available verified articles below.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Browse All Health Articles
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global High-Resolution Full-Screen Image Lightbox */}
      {fullScreenImage && (
        <FullScreenImageViewer
          isOpen={true}
          imageUrl={fullScreenImage.url}
          title={fullScreenImage.title}
          subtitle={fullScreenImage.subtitle}
          onClose={() => setFullScreenImage(null)}
        />
      )}
    </section>
  );
};
