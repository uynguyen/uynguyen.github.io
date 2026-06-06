const { Component } = require('inferno');

const DONATE_ICONS = {
    buymeacoffee: 'fas fa-coffee',
    paypal: 'fab fa-paypal',
    patreon: 'fab fa-patreon',
    alipay: 'fab fa-alipay',
    wechat: 'fab fa-weixin'
};

module.exports = class extends Component {
    render() {
        const { config, helper } = this.props;
        const { __, url_for } = helper;
        const { donates = [] } = config;
        if (!Array.isArray(donates) || !donates.length) {
            return null;
        }
        const items = donates.map(service => {
            const type = service.type;
            const url = service.url ? url_for(service.url) : null;
            if (!url) {
                return null;
            }
            return {
                url,
                label: __('donate.' + type),
                icon: DONATE_ICONS[type] || null,
                isWarning: type === 'paypal'
            };
        }).filter(Boolean);
        if (!items.length) {
            return null;
        }
        return <div class="card donate-card" style={{
            'background': 'linear-gradient(135deg, #e9f7ff 0%, #eafdf5 100%)',
            'border': '1px solid rgba(35,182,230,0.30)',
            'border-radius': '16px',
            'box-shadow': '0 12px 30px -18px rgba(35,182,230,0.35)',
        }}>
            <div class="card-content has-text-centered">
                <p style={{ 'font-size': '1.5rem', 'margin-bottom': '0.25rem' }}>☕</p>
                <h3 style={{
                    'font-size': '1rem',
                    'font-weight': '700',
                    'color': '#0e7c93',
                    'margin-bottom': '1rem',
                    'letter-spacing': '0.3px',
                }}>{__('donate.title')}</h3>
                <div class="buttons is-centered" style={{ 'margin-bottom': '0.5rem' }}>
                    {items.map(({ url, label, icon, isWarning }) => (
                        <a class={'button donate' + (isWarning ? ' is-warning' : '')} href={url} target="_blank" rel="noopener">
                            {icon ? <span class="icon is-small"><i class={icon}></i></span> : null}
                            <span>{label}</span>
                        </a>
                    ))}
                </div>
                <p style={{
                    'font-size': '0.8rem',
                    'color': '#6e6e73',
                    'margin-top': '0',
                }}>Your support helps me keep writing and sharing 🙏</p>
            </div>
        </div>;
    }
};
