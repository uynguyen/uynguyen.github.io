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

        const currentLangName = languages.find(l => l.code === currentLang)?.name || 'Language';

        return <Fragment>
            <nav class="navbar navbar-main">
                <div class="container">
                    <div class="navbar-brand">
                        <a class="navbar-item navbar-logo uy-brand" href={siteUrl}>
                            {logo && logo.text ? logo.text : <img class="uy-brand-avatar" src={logoUrl} alt={siteTitle} />}
                            <span class="uy-brand-name">Uy Nguyen</span>
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
                            {/* Desktop language switcher */}
                            {languages && languages.length > 0 ?
                                <div class="navbar-item has-dropdown is-hoverable language-switcher is-hidden-mobile">
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
                            {/* Desktop search */}
                            {showSearch ? <a class="navbar-item search is-hidden-mobile" title={searchTitle} href="javascript:;">
                                <i class="fas fa-search"></i>
                            </a> : null}
                            {/* Dark mode toggle — desktop */}
                            <a class="navbar-item dark-mode-toggle is-hidden-mobile" href="javascript:;" title="Switch to dark mode">
                                <i class="fas fa-moon"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile toolbar - separate row for language and search */}
            <div class="mobile-toolbar is-hidden-tablet">
                <div class="container">
                    <div class="mobile-toolbar-content">
                        {languages && languages.length > 0 ?
                            <button class="mobile-toolbar-btn" id="mobile-lang-btn" title={langSwitcherTitle}>
                                <i class="fas fa-globe"></i>
                                <span>{currentLangName}</span>
                            </button>
                        : null}
                        {showSearch ?
                            <button class="mobile-toolbar-btn search" title={searchTitle}>
                                <i class="fas fa-search"></i>
                                <span>{searchTitle}</span>
                            </button>
                        : null}
                        {/* Dark mode toggle — mobile */}
                        <button class="mobile-toolbar-btn dark-mode-toggle" title="Switch to dark mode">
                            <i class="fas fa-moon"></i>
                            <span>Theme</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile language picker modal */}
            {languages && languages.length > 0 ?
                <div class="language-picker-overlay" id="lang-picker-overlay">
                    <div class="language-picker-backdrop"></div>
                    <div class="language-picker-modal">
                        <div class="language-picker-header">
                            <span>{langSwitcherTitle}</span>
                            <button class="language-picker-close" id="lang-picker-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="language-picker-options">
                            {languages.map(lang => (
                                <a class={classname({'language-picker-option': true, 'is-active': lang.code === currentLang})}
                                   href={lang.url}>
                                    <span class="lang-name">{lang.name}</span>
                                    {lang.code === currentLang ? <i class="fas fa-check"></i> : null}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            : null}
        </Fragment>;
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
            const sourceParts = page.source.split('/');
            const filename = sourceParts[sourceParts.length - 1];
            postSlug = filename.replace(/\.md$/, '');
        } else if (isPost && pagePath) {
            const pathParts = pagePath.split('/').filter(p => p && p !== 'index.html');
            if (pathParts.length > 0) {
                postSlug = pathParts[pathParts.length - 1];
            }
        }

        Object.keys(language_switcher.languages).forEach(langCode => {
            const langName = language_switcher.languages[langCode];
            let langUrl;

            if (isPost && postSlug && page.date) {
                if (langCode === 'en') {
                    // English posts use date-based URLs
                    const date = new Date(page.date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    langUrl = url_for(`/${year}/${month}/${day}/${postSlug}/`);
                } else {
                    // Translated posts are pages at /{lang}/posts/{slug}.html
                    langUrl = url_for(`/${langCode}/posts/${postSlug}.html`);
                }
            } else {
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
