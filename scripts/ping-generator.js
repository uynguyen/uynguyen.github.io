/**
 * Ping-aware index generator
 * Posts with `ping: true` in frontmatter appear at the top of every index page,
 * sorted by date among themselves, followed by normal posts sorted by date.
 *
 * This generator registers under the same name ('index') as hexo-generator-index.
 * Because scripts load after node_modules, its output overwrites the default
 * /index.html and /page/N/index.html routes produced by hexo-generator-index.
 */

'use strict';

const pagination = require('hexo-pagination');

hexo.extend.generator.register('index', function (locals) {
    const config = this.config;
    const paginationDir = config.pagination_dir || 'page';
    const path = config.index_generator.path || '';

    const all = locals.posts.toArray();
    const sorted = pingSort(all);

    // Wrap in an object that quacks like a Warehouse query (pagination needs .length and .slice)
    const postList = wrapArray(sorted);

    return pagination(path, postList, {
        perPage: config.index_generator.per_page,
        layout: ['index', 'archive'],
        format: paginationDir + '/%d/',
        data: { __index: true }
    });
});

/**
 * Sort pinned posts first (by date desc), then normal posts (by date desc).
 */
function pingSort(posts) {
    const pinned = posts.filter(p => p.ping === true).sort(byDateDesc);
    const normal = posts.filter(p => p.ping !== true).sort(byDateDesc);
    return pinned.concat(normal);
}

function byDateDesc(a, b) {
    return b.date - a.date;
}

/**
 * Wrap a plain array so hexo-pagination can call .length and .slice on it.
 */
function wrapArray(arr) {
    return {
        length: arr.length,
        slice: (start, end) => arr.slice(start, end),
        toArray: () => arr
    };
}
