const logger = require('hexo-log')();
const { Component } = require('inferno');
const view = require('hexo-component-inferno/lib/core/view');

module.exports = class extends Component {
    render() {
        const { config, helper } = this.props;
        const { __ } = helper;
        const { donates = [] } = config;
        if (!Array.isArray(donates) || !donates.length) {
            return null;
        }
        return <div class="card" style={{
            'background': 'linear-gradient(135deg, #fff8f5, #fff3ee)',
            'border': '2px solid rgba(255,107,53,0.25)',
            'border-radius': '8px',
            'box-shadow': '0 4px 16px rgba(255,107,53,0.12)',
        }}>
            <div class="card-content has-text-centered">
                <p style={{ 'font-size': '1.5rem', 'margin-bottom': '0.25rem' }}>☕</p>
                <h3 style={{
                    'font-size': '1rem',
                    'font-weight': '600',
                    'color': '#cc4a1a',
                    'margin-bottom': '1rem',
                    'letter-spacing': '0.3px',
                }}>{__('donate.title')}</h3>
                <div class="buttons is-centered" style={{ 'margin-bottom': '0.5rem' }}>
                    {donates.map(service => {
                        const type = service.type;
                        if (typeof type === 'string') {
                            try {
                                let Donate = view.require('donate/' + type);
                                Donate = Donate.Cacheable ? Donate.Cacheable : Donate;
                                return <Donate helper={helper} donate={service} />;
                            } catch (e) {
                                logger.w(`Icarus cannot load donate button "${type}"`);
                            }
                        }
                        return null;
                    })}
                </div>
                <p style={{
                    'font-size': '0.8rem',
                    'color': '#999',
                    'margin-top': '0',
                }}>Your support helps me keep writing and sharing 🙏</p>
            </div>
        </div>;
    }
};
