/**
 * Custom generator for language-specific index pages
 * This filters posts by language and generates paginated index pages
 *
 * Note: Vietnamese/Spanish posts are in source/vi/posts and source/es/posts
 * Hexo treats these as pages (not posts) since they're not in _posts directory
 * So we filter locals.pages by layout: post and lang property
 */

hexo.extend.generator.register('lang-index', function(locals) {
    const config = this.config;
    const languages = ['vi', 'es'];
    const perPage = config.per_page || 10;
    const results = [];

    languages.forEach(lang => {
        // Look for pages that have layout: post and the matching language
        const langPosts = locals.pages.filter(page => {
            const pageLang = page.lang || page.language || 'en';
            const isPost = page.layout === 'post';
            return isPost && pageLang === lang;
        }).sort('-date');

        if (langPosts.length === 0) return;

        // Convert to array for pagination
        const postsArray = langPosts.toArray();
        const totalPages = Math.ceil(postsArray.length / perPage);

        for (let i = 0; i < totalPages; i++) {
            const pageNum = i + 1;
            const startIdx = i * perPage;
            const endIdx = Math.min(startIdx + perPage, postsArray.length);
            const pagePosts = postsArray.slice(startIdx, endIdx);

            let pagePath;
            if (pageNum === 1) {
                pagePath = `${lang}/index.html`;
            } else {
                pagePath = `${lang}/page/${pageNum}/index.html`;
            }

            // Create a simple object that mimics what index.jsx expects
            results.push({
                path: pagePath,
                layout: ['index', 'archive'],
                data: {
                    base: `/${lang}/`,
                    total: totalPages,
                    current: pageNum,
                    posts: {
                        map: (fn) => pagePosts.map(fn),
                        forEach: (fn) => pagePosts.forEach(fn),
                        length: pagePosts.length,
                        toArray: () => pagePosts,
                        data: pagePosts
                    },
                    prev: pageNum > 1 ? pageNum - 1 : 0,
                    prev_link: pageNum > 1 ? (pageNum === 2 ? `/${lang}/` : `/${lang}/page/${pageNum - 1}/`) : '',
                    next: pageNum < totalPages ? pageNum + 1 : 0,
                    next_link: pageNum < totalPages ? `/${lang}/page/${pageNum + 1}/` : '',
                    lang: lang,
                    language: lang
                }
            });
        }
    });

    return results;
});
