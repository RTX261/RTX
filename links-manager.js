/**
 * نظام تحديث الروابط والحالات من البوت إلى GitHub مباشرة
 * - iPhone: للمالك فقط
 * - Android/PC/Pekora: للأدمن والموديريتورز
 * بدون مكتبات خارجية — يستخدم https المدمج في Node
 */

const https = require('https');

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

// ══════════════════════════════════════════════════════════════════
// كلاس زر التحميل لكل منصة
// نستخدمه للتمييز بين المنصات في HTML
// مثلاً: "Delta Install" موجود في آيفون وأندرويد — نميزهم بالكلاس
// ══════════════════════════════════════════════════════════════════
const PLATFORM_BTN_CLASS = {
    'iphone':         'download-btn"',
    'android':        'download-btn android-btn"',
    'pc':             'download-btn pc-btn"',
    'pekora-iphone':  'download-btn pekora-iphone-btn"',
    'pekora-android': 'download-btn pekora-android-btn"',
    'pekora-pc':      'download-btn pc-btn"',
};

// ══════════════════════════════════════════════════════════════════
// دوال مساعدة
// ══════════════════════════════════════════════════════════════════

// تحويل الأسماء العربية إلى القيم الإنجليزية
const ARABIC_TO_VALUE = {
    'دلتا': 'delta', 'delta': 'delta',
    'كوديكس': 'codex', 'codex': 'codex',
    'ارسيوس': 'arceus', 'ارسيوس اكس نيو': 'arceus', 'arceus': 'arceus',
    'رونيكس': 'ronix', 'ronix': 'ronix',
    'سكيبكس': 'skibx', 'skibx': 'skibx',
    'كرايبتك': 'cryptic', 'cryptic': 'cryptic',
    'تريجون': 'trigon', 'trigon': 'trigon',
    'فيجا': 'vega', 'فيجا اكس': 'vega', 'vega': 'vega',
    'سيمو': 'semo', 'semo': 'semo',
    'فيلوسيتي': 'velocity', 'velocity': 'velocity',
    'اكسينو': 'xeno', 'xeno': 'xeno',
    '2017': '2017', '2018': '2018', '2020': '2020', '2021': '2021',
    '2017-official': '2017-official', '2017-unofficial': '2017-unofficial',
};

/**
 * جلب نص الزر المطلوب لهاك ومنصة محددة
 */
function getButtonText(hackName, platform, isVNG) {
    const raw = hackName.toLowerCase().trim();
    const normalized = ARABIC_TO_VALUE[raw] || ARABIC_TO_VALUE[hackName.trim()] || raw;
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

// ══════════════════════════════════════════════════════════════════
// تحديث HTML
// ══════════════════════════════════════════════════════════════════

/**
 * تحديث رابط زر في HTML
 * يبحث بكلاس المنصة + نص الزر معاً لتجنب تعديل منصة غلط
 */
function updateLinkInHTML(html, hackName, platform, newUrl, isVNG) {
    if (!html || !hackName || !platform || !newUrl) {
        throw new Error('معاملات غير صحيحة');
    }

    const buttonText = getButtonText(hackName, platform, isVNG);
    const escapedText = buttonText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const btnClass = PLATFORM_BTN_CLASS[platform];
    if (!btnClass) throw new Error(`المنصة "${platform}" غير مدعومة`);

    // يبحث بكلاس المنصة + نص الزر — يمنع التجاوز بين الأزرار
    // [^>]*> تتوقف عند إغلاق <a> بدل [\s\S]*? التي تقفز عبر أزرار متعددة
    // ملاحظة: btnClass يتضمن علامة " في نهايته لذا لا نضيف " إضافية
    const pattern = new RegExp(
        `(<a href=")[^"]*(" class="${btnClass}[^>]*>\\s*<i[^>]*></i>\\s*${escapedText})`,
        'is'
    );

    if (!pattern.test(html)) {
        throw new Error(`لم يتم العثور على زر "${buttonText}" للمنصة "${platform}" في ملف HTML`);
    }

    // ✅ الإصلاح: نستخدم دالة بدل string replacement
    // لأن الروابط التي تحتوي على "$1" أو "$&" تسبب خطأ مع string replacement
    return html.replace(pattern, (_, g1, g2) => g1 + newUrl + g2);
}

/**
 * تحديث حالة هاك في HTML (working / not-working / maybe)
 * يبحث بكلاس المنصة + نص الزر لتجنب تعديل منصة غلط
 */
function updateStatusInHTML(html, hackName, platform, newStatus, isVNG) {
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
    const escapedText = buttonText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const btnClass = PLATFORM_BTN_CLASS[platform];
    if (!btnClass) throw new Error(`المنصة "${platform}" غير مدعومة`);

    // يبحث عن badge ثم مباشرة الزر بعده — بدون تجاوز tags
    // [^>]* تتوقف عند أول > فلا تتجاوز الـ <a> tag إلى الأزرار التالية
    const pattern = new RegExp(
        `(<span class="status-badge )[^"]+("[^>]*>)` +
        `<span class="status-text">[^<]*<\\/span>` +
        `<span class="status-icon">[^<]*<\\/span>` +
        `(<\\/span>\\s*<a[^>]*class="${btnClass}[^>]*>\\s*<i[^>]*><\\/i>\\s*${escapedText})`,
        'is'
    );

    if (!pattern.test(html)) {
        throw new Error(`لم يتم العثور على حالة الزر "${buttonText}" للمنصة "${platform}" في ملف HTML`);
    }

    return html.replace(
        pattern,
        (_, g1, g2, g3) =>
            g1 + cfg.cls + g2 +
            `<span class="status-text">${cfg.text}</span>` +
            `<span class="status-icon">${cfg.icon}</span>` +
            g3
    );
}

// ══════════════════════════════════════════════════════════════════
// GitHub API — https المدمج في Node (بدون مكتبات خارجية)
// ══════════════════════════════════════════════════════════════════
const GITHUB_OWNER = 'RTX261';
const GITHUB_REPO  = 'RTX';
const GITHUB_FILE  = 'index.html';

/**
 * طلب HTTP مساعد — يرجع { statusCode, data }
 */
function githubRequest(method, path, body, githubToken) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const req = https.request({
            hostname: 'api.github.com',
            path,
            method,
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'RTX-Discord-Bot',
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
            },
        }, (res) => {
            let raw = '';
            res.on('data', chunk => raw += chunk);
            res.on('end', () => {
                try { resolve({ statusCode: res.statusCode, data: JSON.parse(raw) }); }
                catch { resolve({ statusCode: res.statusCode, data: raw }); }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

/**
 * قراءة ملف HTML من GitHub
 * @returns {{ content: string, sha: string }}
 */
async function readFromGitHub(githubToken) {
    const path = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
    const { statusCode, data } = await githubRequest('GET', path, null, githubToken);
    if (statusCode !== 200) {
        throw new Error(`فشل قراءة الملف من GitHub: ${data && data.message ? data.message : statusCode}`);
    }
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content, sha: data.sha };
}

/**
 * حفظ ملف HTML في GitHub
 */
async function saveToGitHub(newContent, sha, commitMsg, githubToken) {
    const path = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
    const base64Content = Buffer.from(newContent, 'utf8').toString('base64');
    const { statusCode, data } = await githubRequest('PUT', path, {
        message: commitMsg || `تحديث ${GITHUB_FILE}`,
        content: base64Content,
        sha,
        branch: 'main',
    }, githubToken);
    if (statusCode !== 200 && statusCode !== 201) {
        throw new Error(`فشل حفظ الملف في GitHub: ${data && data.message ? data.message : statusCode}`);
    }
    return { success: true };
}

/**
 * تحقق إن الرابط الجديد موجود فعلاً في GitHub بعد الحفظ
 */
async function verifyLinkInGitHub(githubToken, expectedUrl) {
    try {
        const { content } = await readFromGitHub(githubToken);
        return { ok: true, foundUrl: content.includes(expectedUrl) };
    } catch (e) {
        return { ok: false, foundUrl: false };
    }
}

// ══════════════════════════════════════════════════════════════════
module.exports = {
    HACK_CHOICES,
    VNG_SUPPORTED,
    BUTTON_TEXTS,
    getButtonText,
    updateLinkInHTML,
    updateStatusInHTML,
    readFromGitHub,
    saveToGitHub,
    verifyLinkInGitHub,
};
