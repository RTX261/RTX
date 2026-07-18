/**
 * نظام تحديث الروابط والحالات من البوت إلى GitHub مباشرة
 * - iPhone: للمالك فقط
 * - Android/PC/Pekora: للأدمن والموديريتورز
 */

const axios = require('axios');

// ══════════════════════════════════════════════════════════════════
// اختيارات الهاكات حسب المنصة (للـ Autocomplete)
// ══════════════════════════════════════════════════════════════════
const HACK_CHOICES = {
    'iphone': [
        { name: 'دلتا',   value: 'delta' },
        { name: 'رونيكس', value: 'ronix' },
        { name: 'سكيبكس', value: 'skibx' },
    ],
    'android': [
        { name: 'دلتا',           value: 'delta'   },
        { name: 'كوديكس',         value: 'codex'   },
        { name: 'ارسيوس اكس نيو', value: 'arceus'  },
        { name: 'رونيكس',         value: 'ronix'   },
        { name: 'سكيبكس',         value: 'skibx'   },
        { name: 'كرايبتك',        value: 'cryptic' },
        { name: 'تريجون',         value: 'trigon'  },
        { name: 'فيجا اكس',       value: 'vega'    },
    ],
    'pc': [
        { name: 'سيمو',      value: 'semo'     },
        { name: 'فيلوسيتي', value: 'velocity' },
        { name: 'اكسينو',   value: 'xeno'     },
        { name: 'رونيكس',   value: 'ronix'    },
        { name: 'تريجون',   value: 'trigon'   },
    ],
    'pekora-iphone': [
        { name: '2017', value: '2017' },
        { name: '2018', value: '2018' },
        { name: '2020', value: '2020' },
        { name: '2021', value: '2021' },
    ],
    'pekora-android': [
        { name: '2017 (رسمي)',      value: '2017-official'   },
        { name: '2017 (غير رسمي)', value: '2017-unofficial' },
        { name: '2018',             value: '2018'            },
        { name: '2020',             value: '2020'            },
        { name: '2021',             value: '2021'            },
    ],
    'pekora-pc': [
        { name: '2017', value: '2017' },
        { name: '2018', value: '2018' },
        { name: '2020', value: '2020' },
        { name: '2021', value: '2021' },
    ],
};

// الهاكات التي تدعم نسخة VNG
const VNG_SUPPORTED = [
    'iphone::delta', 'iphone::ronix', 'iphone::skibx',
    'android::delta', 'android::codex', 'android::arceus',
    'android::ronix', 'android::skibx', 'android::cryptic',
];

// ══════════════════════════════════════════════════════════════════
// نصوص أزرار التحميل — نبحث بها في HTML بدل URLs محددة
// ══════════════════════════════════════════════════════════════════
const BUTTON_TEXTS = {
    'iphone': {
        'delta': ['Delta Install',      'Delta VNG Install'     ],
        'ronix': ['Ronix Install',      'Ronix VNG Install'     ],
        'skibx': ['Skibx Install',      'Skibx VNG Install'     ],
    },
    'android': {
        'delta':   ['Delta Install',          'Delta VNG Install'       ],
        'codex':   ['CODEX Install',          'CODEX VNG Install'       ],
        'arceus':  ['Arceus X Neo Install',   'Arceus X Neo VNG Install'],
        'ronix':   ['Ronix Install',          'Ronix VNG Install'       ],
        'skibx':   ['Skibx Install',          'Skibx VNG Install'       ],
        'cryptic': ['Cryptic Install',        'Cryptic VNG Install'     ],
        'trigon':  ['Trigon Install'                                      ],
        'vega':    ['Vega X Install'                                      ],
    },
    'pc': {
        'semo':     ['Semo Install'    ],
        'velocity': ['Velocity Install'],
        'xeno':     ['Xeno Install'    ],
        'ronix':    ['Ronix Install'   ],
        'trigon':   ['Trigon Install'  ],
    },
    'pekora-iphone': {
        '2017': ['Roblox 2017 Install'],
        '2018': ['Roblox 2018 Install'],
        '2020': ['Roblox 2020 Install'],
        '2021': ['Roblox 2021 Install'],
    },
    'pekora-android': {
        '2017-official':   ['Roblox 2017 Install (رسمي)'    ],
        '2017-unofficial': ['Roblox 2017 Install (غير رسمي)'],
        '2018':            ['Roblox 2018 Install'            ],
        '2020':            ['Roblox 2020 Install'            ],
        '2021':            ['Roblox 2021 Install'            ],
    },
    'pekora-pc': {
        '2017': ['Roblox 2017 Install'],
        '2018': ['Roblox 2018 Install'],
        '2020': ['Roblox 2020 Install'],
        '2021': ['Roblox 2021 Install'],
    },
};

/**
 * جلب نص الزر المطلوب لهاك ومنصة محددة
 */
function getButtonText(hackName, platform, isVNG = false) {
    const normalized = hackName.toLowerCase().trim();
    const platformMap = BUTTON_TEXTS[platform];
    if (!platformMap || !platformMap[normalized]) {
        throw new Error(`الهاك "${hackName}" غير مدعوم للمنصة "${platform}"`);
    }
    const texts = platformMap[normalized];
    const idx = isVNG ? 1 : 0;
    if (!texts[idx]) {
        throw new Error(`نسخة VNG غير مدعومة لـ "${hackName}" على "${platform}"`);
    }
    return texts[idx];
}

/**
 * تحديث رابط في HTML
 * يبحث بنص الزر وليس بـ URL محدد — يشتغل مهما كان الرابط الحالي
 */
function updateLinkInHTML(html, hackName, platform, newUrl, isVNG = false) {
    if (!html || !hackName || !platform || !newUrl) {
        throw new Error('معاملات غير صحيحة');
    }

    const buttonText = getButtonText(hackName, platform, isVNG);
    const escaped = buttonText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // يبحث عن: <a href="أي_رابط" ...> ... نص_الزر
    const pattern = new RegExp(
        `(<a href=")[^"]*("[^>]*>[\\s\\S]*?${escaped})`
    );

    if (!pattern.test(html)) {
        throw new Error(`لم يتم العثور على زر "${buttonText}" في ملف HTML`);
    }

    return html.replace(pattern, `$1${newUrl}$2`);
}

/**
 * تحديث حالة هاك في HTML (working / not-working / maybe)
 * يغير الـ class ونص الحالة للزر المحدد
 */
function updateStatusInHTML(html, hackName, platform, newStatus, isVNG = false) {
    if (!html || !hackName || !platform || !newStatus) {
        throw new Error('معاملات غير صحيحة');
    }

    const statusMap = {
        'working':     { cls: 'working',     text: 'يعمل',    icon: '✓' },
        'not-working': { cls: 'not-working', text: 'لا يعمل', icon: '✕' },
        'maybe':       { cls: 'maybe',       text: 'قد يعمل', icon: '⚠' },
    };
    const cfg = statusMap[newStatus];
    if (!cfg) {
        throw new Error('الحالة غير صحيحة. استخدم: working أو not-working أو maybe');
    }

    const buttonText = getButtonText(hackName, platform, isVNG);
    const escaped = buttonText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // يبحث عن: <span class="status-badge CURRENT_CLASS">...text...icon...</span> ... نص_الزر
    // البنية دائمًا: badge ثم بعدها بفراغ قصير زر التحميل
    const pattern = new RegExp(
        `(<span class="status-badge )[^"]+("[^>]*>)` +
        `<span class="status-text">[^<]*<\\/span>` +
        `<span class="status-icon">[^<]*<\\/span>` +
        `(<\\/span>[\\s\\S]{0,600}?${escaped})`
    );

    if (!pattern.test(html)) {
        throw new Error(`لم يتم العثور على حالة الزر "${buttonText}" في ملف HTML`);
    }

    return html.replace(
        pattern,
        `$1${cfg.cls}$2` +
        `<span class="status-text">${cfg.text}</span>` +
        `<span class="status-icon">${cfg.icon}</span>` +
        `$3`
    );
}

// ══════════════════════════════════════════════════════════════════
// GitHub API — باستخدام axios مباشرة (مو discord.js REST)
// ══════════════════════════════════════════════════════════════════
const GITHUB_OWNER = 'RTX261';
const GITHUB_REPO  = 'RTX';
const GITHUB_FILE  = 'index.html';

/**
 * قراءة ملف HTML من GitHub
 * @returns {{ content: string, sha: string }}
 */
async function readFromGitHub(githubToken) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'RTX-Discord-Bot',
            }
        });
        const content = Buffer.from(res.data.content, 'base64').toString('utf8');
        return { content, sha: res.data.sha };
    } catch (error) {
        const msg = error?.response?.data?.message || error.message;
        throw new Error(`فشل قراءة الملف من GitHub: ${msg}`);
    }
}

/**
 * حفظ ملف HTML في GitHub
 * @param {string} newContent - المحتوى الجديد
 * @param {string} sha - الـ SHA الحالي للملف (مطلوب للتحديث)
 * @param {string} commitMessage - رسالة الـ commit
 * @param {string} githubToken - توكن GitHub
 */
async function saveToGitHub(newContent, sha, commitMessage, githubToken) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
    const base64Content = Buffer.from(newContent, 'utf8').toString('base64');
    try {
        await axios.put(url, {
            message: commitMessage || `تحديث ${GITHUB_FILE}`,
            content: base64Content,
            sha,
            branch: 'main',
        }, {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'RTX-Discord-Bot',
            }
        });
        return { success: true };
    } catch (error) {
        const msg = error?.response?.data?.message || error.message;
        throw new Error(`فشل حفظ الملف في GitHub: ${msg}`);
    }
}

module.exports = {
    HACK_CHOICES,
    VNG_SUPPORTED,
    BUTTON_TEXTS,
    getButtonText,
    updateLinkInHTML,
    updateStatusInHTML,
    readFromGitHub,
    saveToGitHub,
};
