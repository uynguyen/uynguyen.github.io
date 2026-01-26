const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const classname = require('hexo-component-inferno/lib/util/classname');

function isSameLink(a, b) {
    function santize(url) {
        let paths = url.replace(/(^\w+:|^)\/\//, '').split('#')[0].split('/').filter(p => p.trim() !== '');
        if (paths.length > 0 && paths[paths.length - 1].trim() === 'index.html') {
            paths = paths.slice(0, paths.length - 1);
        }
        return paths.join('/');
    }
    return santize(a) === santize(b);
}

class Navbar extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            menu,
            links,
            showToc,
            tocTitle,
            showSearch,
            searchTitle,
            languages,
            currentLang,
            langSwitcherTitle
        } = this.props;

        return <nav class="navbar navbar-main">
            <div class="container">
                <div class="navbar-brand justify-content-center">
                    <a class="navbar-item navbar-logo" href={siteUrl}>
                        {logo && logo.text ? logo.text : <img src={logoUrl} alt={siteTitle} height="28" />}
                    </a>
                </div>
                <div class="navbar-menu">
                    {Object.keys(menu).length ? <div class="navbar-start">
                        {Object.keys(menu).map(name => {
                            const item = menu[name];
                            return <a class={classname({ 'navbar-item': true, 'is-active': item.active })} href={item.url}>{name}</a>;
                        })}
                    </div> : null}
                    <div class="navbar-end">
                        {Object.keys(links).length ? <Fragment>
                            {Object.keys(links).map(name => {
                                const link = links[name];
                                return <a class="navbar-item" target="_blank" rel="noopener" title={name} href={link.url}>
                                    {link.icon ? <i class={link.icon}></i> : name}
                                </a>;
                            })}
                        </Fragment> : null}
                        {languages && languages.length > 0 ?
                            <div class="navbar-item has-dropdown is-hoverable language-switcher">
                                <a class="navbar-link" title={langSwitcherTitle}>
                                    <i class="fas fa-globe"></i>
                                </a>
                                <div class="navbar-dropdown is-right">
                                    {languages.map(lang => (
                                        <a class={classname({'navbar-item': true, 'is-active': lang.code === currentLang})}
                                           href={lang.url}>{lang.name}</a>
                                    ))}
                                </div>
                            </div>
                        : null}
                        {showToc ? <a class="navbar-item is-hidden-tablet catalogue" title={tocTitle} href="javascript:;">
                            <i class="fas fa-list-ul"></i>
                        </a> : null}
                        {showSearch ? <a class="navbar-item search" title={searchTitle} href="javascript:;">
                            <i class="fas fa-search"></i>
                        </a> : null}
                    </div>
                </div>
            </div>
        </nav>;
    }
}

module.exports = cacheComponent(Navbar, 'common.navbar', props => {
    const { config, helper, page } = props;
    const { url_for, _p, __ } = helper;
    const { logo, title, navbar, widgets, search, language_switcher } = config;

    const hasTocWidget = Array.isArray(widgets) && widgets.find(widget => widget.type === 'toc');
    const showToc = (config.toc === true || page.toc) && hasTocWidget && ['page', 'post'].includes(page.layout);

    const menu = {};
    if (navbar && navbar.menu) {
        const pageUrl = typeof page.path !== 'undefined' ? url_for(page.path) : '';
        Object.keys(navbar.menu).forEach(name => {
            const url = url_for(navbar.menu[name]);
            const active = isSameLink(url, pageUrl);
            menu[name] = { url, active };
        });
    }

    const links = {};
    if (navbar && navbar.links) {
        Object.keys(navbar.links).forEach(name => {
            const link = navbar.links[name];
            links[name] = {
                url: url_for(typeof link === 'string' ? link : link.url),
                icon: link.icon
            };
        });
    }

    // Language switcher logic
    const languages = [];
    const currentLang = page.lang || page.language || (Array.isArray(config.language) ? config.language[0] : config.language) || 'en';

    if (language_switcher && language_switcher.enabled && language_switcher.languages) {
        const pagePath = page.path || '';
        const isPost = page.layout === 'post';

        // Extract post slug from the current page
        let postSlug = null;
        if (isPost && page.source) {
            // Get the filename without extension and path
            // page.source is like "_posts/My-Post-Title.md" or "vi/posts/My-Post-Title.md"
            const sourceParts = page.source.split('/');
            const filename = sourceParts[sourceParts.length - 1];
            postSlug = filename.replace(/\.md$/, '');
        } else if (isPost && pagePath) {
            // Fallback: extract slug from path
            // English: "2025/04/02/post-slug/index.html" -> "post-slug"
            // Vietnamese/Spanish: "vi/posts/post-slug/index.html" -> "post-slug"
            const pathParts = pagePath.split('/').filter(p => p && p !== 'index.html');
            if (pathParts.length > 0) {
                postSlug = pathParts[pathParts.length - 1];
            }
        }

        Object.keys(language_switcher.languages).forEach(langCode => {
            const langName = language_switcher.languages[langCode];
            let langUrl;

            if (isPost && postSlug) {
                // Build URL to the same post in the selected language
                if (langCode === 'en') {
                    // English posts use the default Hexo permalink: /YYYY/MM/DD/slug/
                    // We can't easily reconstruct the date, so link to home
                    // OR we can try to find the post date from page object
                    if (page.date) {
                        const date = new Date(page.date);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        langUrl = url_for(`/${year}/${month}/${day}/${postSlug}/`);
                    } else {
                        langUrl = url_for('/');
                    }
                } else {
                    // Vietnamese/Spanish posts use: /lang/posts/slug/
                    langUrl = url_for(`/${langCode}/posts/${postSlug}/`);
                }
            } else {
                // Not a post page, link to language home
                if (langCode === 'en') {
                    langUrl = url_for('/');
                } else {
                    langUrl = url_for('/' + langCode + '/');
                }
            }

            languages.push({
                code: langCode,
                name: langName,
                url: langUrl
            });
        });
    }

    return {
        logo,
        logoUrl: url_for(logo),
        siteUrl: url_for('/'),
        siteTitle: title,
        menu,
        links,
        showToc,
        tocTitle: _p('widget.catalogue', Infinity),
        showSearch: search && search.type,
        searchTitle: __('search.search'),
        languages,
        currentLang,
        langSwitcherTitle: __('common.language') || 'Language'
    };
});
