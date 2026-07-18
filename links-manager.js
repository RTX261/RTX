const axios = require('axios');

// قائمة الهاكات المتاحة لكل منصة
const HACK_CHOICES = {
    'iphone':         [{ name: 'دلتا', value: 'delta' }, { name: 'رونيكس', value: 'ronix' }, { name: 'سكيبكس', value: 'skibx' }],
    'android':        [{ name: 'دلتا', value: 'delta' }, { name: 'كوديكس', value: 'codex' }, { name: 'ارسيوس', value: 'arceus' }, { name: 'رونيكس', value: 'ronix' }, { name: 'سكيبكس', value: 'skibx' }, { name: 'كرايبتك', value: 'cryptic' }, { name: 'تريجون', value: 'trigon' }, { name: 'فيجا', value: 'vega' }],
    'pc':             [{ name: 'سيمو', value: 'semo' }, { name: 'فيلوسيتي', value: 'velocity' }, { name: 'اكسينو', value: 'xeno' }, { name: 'رونيكس', value: 'ronix' }, { name: 'تريجون', value: 'trigon' }],
    'pekora-iphone':  [{ name: '2017', value: '2017' }, { name: '2018', value: '2018' }, { name: '2020', value: '2020' }, { name: '2021', value: '2021' }],
    'pekora-android': [{ name: '2017 (رسمي)', value: '2017-official' }, { name: '2017 (غير رسمي)', value: '2017-unofficial' }, { name: '2018', value: '2018' }, { name: '2020', value: '2020' }, { name: '2021', value: '2021' }],
    'pekora-pc':      [{ name: '2017', value: '2017' }, { name: '2018', value: '2018' }, { name: '2020', value: '2020' }, { name: '2021', value: '2021' }],
};

const VNG_SUPPORTED = ['delta', 'codex', 'arceus', 'skibx', 'ronix', 'cryptic', 'trigon', 'vega'];

// قراءة الملف من GitHub
async function readFromGitHub(token) {
    try {
        const response = await axios.get(
            'https://api.github.com/repos/rtx261/RTX/contents/index.html',
            { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3.raw' } }
        );
        const content = response.data;
        const sha = (await axios.get(
            'https://api.github.com/repos/rtx261/RTX/contents/index.html',
            { headers: { 'Authorization': `token ${token}` } }
        )).data.sha;
        return { content, sha };
    } catch (err) {
        console.error('[readFromGitHub]', err.message);
        throw err;
    }
}

// حفظ الملف في GitHub
async function saveToGitHub(content, sha, message, token) {
    try {
        const response = await axios.put(
            'https://api.github.com/repos/rtx261/RTX/contents/index.html',
            {
                message,
                content: Buffer.from(content).toString('base64'),
                sha,
                branch: 'main'
            },
            { headers: { 'Authorization': `token ${token}` } }
        );
        return response.data;
    } catch (err) {
        console.error('[saveToGitHub]', err.message);
        throw err;
    }
}

// تحديث رابط الهاك في HTML
function updateLinkInHTML(html, hackName, platform, newUrl, isVNG) {
    // نبحث عن البطاقة التي تحتوي على اسم الهاك والمنصة
    const hackNameLower = hackName.toLowerCase();
    const platformLower = platform.toLowerCase();
    
    // البحث عن القسم المناسب
    let sectionRegex;
    if (platform.includes('pekora')) {
        sectionRegex = new RegExp(`(<div id="${platform}"[^>]*>.*?)(<a[^>]*href="[^"]*"[^>]*>[^<]*pekora[^<]*</a>)`, 'is');
    } else {
        sectionRegex = new RegExp(`(<h2>.*?${hackName}.*?</h2>.*?)(<a[^>]*href="[^"]*"[^>]*download[^>]*href="([^"]*)"[^>]*>)`, 'is');
    }

    const label = isVNG ? ' VNG' : '';
    const linkRegex = new RegExp(`(href=")([^"]*)(")`, 'g');

    // إذا كان VNG نبحث عن رابط VNG
    if (isVNG) {
        const vngPattern = new RegExp(
            `<h2>.*?${hackName}.*?مميزات.*?</h2>.*?(?=<h2>|</div>)`,
            'is'
        );
        const match = html.match(vngPattern);
        if (match) {
            const section = match[0];
            const vngLinkRegex = /VNG Install<\/a>/;
            const vngIndex = section.lastIndexOf('VNG Install</a>');
            if (vngIndex > -1) {
                const linkStart = section.lastIndexOf('href="', vngIndex);
                const linkEnd = section.indexOf('"', linkStart + 6);
                if (linkStart > -1 && linkEnd > -1) {
                    const oldUrl = section.substring(linkStart + 6, linkEnd);
                    return html.replace(oldUrl, newUrl);
                }
            }
        }
    } else {
        // غير VNG - نبحث عن أول رابط تحميل
        const pattern = new RegExp(
            `<h2>.*?${hackName}.*?مميزات.*?</h2>.*?<a[^>]*href="[^"]*"[^>]*>\\s*<i[^>]*></i>.*?Install\\s*</a>`,
            'is'
        );
        const match = html.match(pattern);
        if (match) {
            const linkRegexLocal = /href="([^"]*)"/;
            const linkMatch = match[0].match(linkRegexLocal);
            if (linkMatch && linkMatch[1]) {
                return html.replace(linkMatch[1], newUrl);
            }
        }
    }

    return html;
}

// تحديث حالة الهاك (يعمل / لا يعمل / قد يعمل)
function updateStatusInHTML(html, hackName, platform, newStatus, isVNG) {
    const statusEmoji = {
        'working':     '✅',
        'not-working': '❌',
        'maybe':       '⚠️'
    };
    
    const statusText = {
        'working':     'يعمل',
        'not-working': 'لا يعمل',
        'maybe':       'قد يعمل'
    };

    const emoji = statusEmoji[newStatus] || '⚠️';
    const text = statusText[newStatus] || 'قد يعمل';

    // البحث عن شارة الحالة وتحديثها
    const pattern = new RegExp(
        `(<h2>.*?${hackName}.*?</h2>.*?${isVNG ? 'VNG' : 'Install'}.*?<span class="status-badge[^>]*>\\s*<span class="status-text">)[^<]*(</span>)`,
        'is'
    );

    return html.replace(pattern, `$1${text}$2`);
}

// التحقق من وجود الرابط في GitHub
async function verifyLinkInGitHub(token, url) {
    try {
        const { content } = await readFromGitHub(token);
        const found = content.includes(url);
        return { ok: true, foundUrl: found };
    } catch (err) {
        console.error('[verifyLinkInGitHub]', err.message);
        return { ok: false, foundUrl: false };
    }
}

module.exports = {
    HACK_CHOICES,
    VNG_SUPPORTED,
    readFromGitHub,
    saveToGitHub,
    updateLinkInHTML,
    updateStatusInHTML,
    verifyLinkInGitHub
};
