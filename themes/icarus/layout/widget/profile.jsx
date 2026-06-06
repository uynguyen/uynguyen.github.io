const { Component } = require('inferno');
const gravatrHelper = require('hexo-util').gravatar;
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Profile extends Component {
    renderSocialLinks(links) {
        if (!links.length) {
            return null;
        }
        return <div class="uy-profile-social">
            {links.filter(link => typeof link === 'object').map(link => {
                return <a class="uy-social-btn"
                    target="_blank" rel="noopener" title={link.name} aria-label={link.name} href={link.url}>
                    {'icon' in link ? <i class={link.icon}></i> : link.name}
                </a>;
            })}
        </div>;
    }

    renderDonates(donates) {
        if (!donates || !donates.length) {
            return null;
        }
        return <div class="donate-card" style={{
            'border-radius': '16px',
            'padding': '1.1rem 1rem',
            'margin-top': '1rem',
            'text-align': 'center',
        }}>
            <p style={{ 'font-size': '1.3rem', 'margin-bottom': '0.2rem', 'position': 'relative', 'z-index': '1' }}>☕</p>
            <p style={{
                'font-size': '0.85rem',
                'font-weight': '700',
                'color': '#0e7c93',
                'margin-bottom': '0.75rem',
                'position': 'relative',
                'z-index': '1',
            }}>{this.props.donateTitle}</p>
            <div class="buttons is-centered" style={{ 'margin-bottom': '0.4rem', 'position': 'relative', 'z-index': '1' }}>
                {donates.map(({ url, label, icon, isWarning }) => (
                    <a class={'button donate' + (isWarning ? ' is-warning' : '')} href={url} target="_blank" rel="noopener">
                        {icon ? <span class="icon is-small"><i class={icon}></i></span> : null}
                        <span>{label}</span>
                    </a>
                ))}
            </div>
            <p style={{ 'font-size': '0.75rem', 'color': '#6e6e73', 'margin': '0', 'position': 'relative', 'z-index': '1' }}>
                Your support helps me keep writing and sharing 🙏
            </p>
        </div>;
    }

    render() {
        const {
            avatar,
            avatarRounded,
            author,
            authorTitle,
            location,
            counter,
            socialLinks,
            donates,
        } = this.props;
        return <div class="card widget uy-profile">
            <div class="uy-profile-cover"></div>
            <div class="card-content uy-profile-body">
                <figure class="uy-profile-avatar">
                    <img src={avatar} alt={author} />
                </figure>
                {author ? <p class="uy-profile-name">{author}</p> : null}
                {authorTitle ? <p class="uy-profile-role">{authorTitle}</p> : null}
                <div class="uy-profile-meta">
                    {location ? <span><i class="fas fa-map-marker-alt"></i>{location}</span> : null}
                    <a href="mailto:uynguyen.itus@gmail.com"><i class="fas fa-envelope"></i>uynguyen.itus@gmail.com</a>
                </div>
                <div class="uy-profile-stats">
                    <a class="uy-stat" href={counter.post.url}>
                        <span class="uy-stat-num">{counter.post.count}</span>
                        <span class="uy-stat-label">{counter.post.title}</span>
                    </a>
                    <a class="uy-stat" href={counter.tag.url}>
                        <span class="uy-stat-num">{counter.tag.count}</span>
                        <span class="uy-stat-label">{counter.tag.title}</span>
                    </a>
                </div>
                {socialLinks ? this.renderSocialLinks(socialLinks) : null}
                {this.renderDonates(donates)}
            </div>
        </div>;
    }
}

Profile.Cacheable = cacheComponent(Profile, 'widget.profile', props => {
    const { site, helper, widget, config } = props;
    const {
        avatar,
        gravatar,
        avatar_rounded = false,
        author = props.config.author,
        author_title,
        location,
        social_links
    } = widget;
    const { url_for, _p, __ } = helper;

    function getAvatar() {
        if (gravatar) {
            return gravatrHelper(gravatar, 128);
        }
        if (avatar) {
            return url_for(avatar);
        }
        return url_for('/img/avatar.png');
    }

    const postCount = site.posts.length;
    const categoryCount = site.categories.filter(category => category.length).length;
    const tagCount = site.tags.filter(tag => tag.length).length;

    const socialLinks = social_links ? Object.keys(social_links).map(name => {
        const link = social_links[name];
        if (typeof link === 'string') {
            return {
                name,
                url: url_for(link)
            };
        }
        return {
            name,
            url: url_for(link.url),
            icon: link.icon
        };
    }) : null;

    const DONATE_ICONS = {
        buymeacoffee: 'fas fa-coffee',
        paypal: 'fab fa-paypal',
        patreon: 'fab fa-patreon',
        alipay: 'fab fa-alipay',
        wechat: 'fab fa-weixin'
    };
    const donateServices = Array.isArray(config.donates) ? config.donates : [];
    const donates = donateServices.map(service => {
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

    return {
        avatar: getAvatar(),
        avatarRounded: avatar_rounded,
        author,
        authorTitle: author_title,
        location,
        counter: {
            post: {
                count: postCount,
                title: _p('common.post', postCount),
                url: url_for('/archives')
            },
            category: {
                count: categoryCount,
                title: _p('common.category', categoryCount),
                url: url_for('/categories')
            },
            tag: {
                count: tagCount,
                title: _p('common.tag', tagCount),
                url: url_for('/tags')
            }
        },
        donates,
        donateTitle: __('donate.title'),
        socialLinks
    };
});

module.exports = Profile;
