const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Footer extends Component {
    render() {
        const {
            siteUrl,
            siteYear,
            nav,
            social,
            showVisitorCounter,
            visitorCounterTitle
        } = this.props;

        return <footer class="footer uy-footer">
            <div class="uy-footer-inner">
                <div class="uy-footer-top">
                    <div class="uy-footer-brand">
                        <a class="uy-footer-name" href={siteUrl}>Uy Nguyen</a>
                        <p class="uy-footer-tagline">Software Engineer · Mobile &amp; Bluetooth Low Energy</p>
                    </div>
                    <nav class="uy-footer-nav">
                        {nav.map(item => <a href={item.url}>{item.name}</a>)}
                    </nav>
                    <div class="uy-footer-social">
                        {social.map(item => <a href={item.url} target="_blank" rel="noopener" title={item.title} aria-label={item.title}>
                            <i class={item.icon}></i>
                        </a>)}
                    </div>
                </div>
                <div class="uy-footer-bottom">
                    <span>
                        <span dangerouslySetInnerHTML={{ __html: `&copy; ${siteYear} Uy Nguyen` }}></span>
                        {showVisitorCounter ? <span>&nbsp;·&nbsp;</span> : null}
                        {showVisitorCounter ? <span id="busuanzi_container_site_uv"
                            dangerouslySetInnerHTML={{ __html: visitorCounterTitle }}></span> : null}
                    </span>
                    <span>
                        Built with <a href="https://hexo.io/" target="_blank" rel="noopener">Hexo</a>
                        &nbsp;&amp;&nbsp;
                        <a href="https://github.com/ppoffice/hexo-theme-icarus" target="_blank" rel="noopener">Icarus</a>
                    </span>
                </div>
            </div>
        </footer>;
    }
}

module.exports = cacheComponent(Footer, 'common.footer', props => {
    const { config, helper } = props;
    const { url_for, _p, date } = helper;
    const { plugins } = config;

    const nav = [
        { name: 'Home', url: url_for('/') },
        { name: 'Archives', url: url_for('/archives') },
        { name: 'Tags', url: url_for('/tags') },
        { name: 'Signal Hub', url: url_for('/signal-hub/') }
    ];

    const social = [
        { title: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/uynguyen' },
        { title: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'javascript:void(0)' },
        { title: 'Email', icon: 'fas fa-envelope', url: 'mailto:uynguyen.itus@gmail.com' }
    ];

    return {
        siteUrl: url_for('/'),
        siteYear: date(new Date(), 'YYYY'),
        nav,
        social,
        showVisitorCounter: plugins && plugins.busuanzi === true,
        visitorCounterTitle: _p('plugin.visitor', '<span id="busuanzi_value_site_uv">0</span>')
    };
});
