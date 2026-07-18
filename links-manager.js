/**
 * نظام تحديث الروابط والحالات من البوت إلى GitHub مباشرة
 * - iPhone: للمالك فقط
 * - Android/PC/Pekora: للأدمن والموديريتورز
 */

const { REST, Routes } = require('discord.js');

// ============= قوائم الاختيار للـ autocomplete =============
const HACK_CHOICES = {
    'android': [
        { name: 'دلتا',        value: 'delta'   },
        { name: 'كوديكس',      value: 'codex'   },
        { name: 'ارسيوس اكس نيو', value: 'arceus' },
        { name: 'رونيكس',      value: 'ronix'   },
        { name: 'سكيبكس',      value: 'skibx'   },
        { name: 'كرايبتك',     value: 'cryptic' },
        { name: 'تريجون',      value: 'trigon'  },
        { name: 'فيجا اكس',    value: 'vega'    }
    ],
    'iphone': [
        { name: 'دلتا',        value: 'delta'   },
        { name: 'سكيبكس',      value: 'skibx'   },
        { name: 'رونيكس',      value: 'ronix'   }
    ],
    'pc': [
        { name: 'سيمو',        value: 'semo'     },
        { name: 'فيلوسيتي',    value: 'velocity' },
        { name: 'اكسينو',      value: 'xeno'     },
        { name: 'رونيكس',      value: 'ronix'    },
        { name: 'تريجون',      value: 'trigon'   }
    ],
    'pekora-iphone': [
        { name: '2017',        value: '2017'     },
        { name: '2018',        value: '2018'     },
        { name: '2020',        value: '2020'     },
        { name: '2021',        value: '2021'     }
    ],
    'pekora-android': [
        { name: '2017 (رسمي)',     value: '2017-official'   },
        { name: '2017 (غير رسمي)', value: '2017-unofficial' },
        { name: '2018',            value: '2018'            },
        { name: '2020',            value: '2020'            },
        { name: '2021',            value: '2021'            }
    ],
    'pekora-pc': [
        { name: '2017',        value: '2017'     },
        { name: '2018',        value: '2018'     },
        { name: '2020',        value: '2020'     },
        { name: '2021',        value: '2021'     }
    ]
};

const VNG_SUPPORTED = ['دلتا', 'كوديكس', 'ارسيوس اكس نيو', 'رونيكس', 'سكيبكس', 'كرايبتك'];

// ============= دوال التحديث =============

/**
 * تحديث رابط في الـ HTML
 */
function updateLinkInHTML(html, hackName, platform, newUrl, isVNG = false) {
    if (!html || !hackName || !platform || !newUrl) {
        throw new Error('معاملات غير صحيحة');
    }

    const normalized = hackName.toLowerCase().trim();
    
    const patterns = {
        'iphone': {
            'delta': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/delta\.bz\/manifest\.plist(".*?Delta Install)/,
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/x5eYMW\/x5eYMW\.plist(".*?Delta VNG Install)/
            ],
            'ronix': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/KvQcmP\/KvQcmP\.plist(".*?Ronix Install)/,
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/lgqV2v\/lgqV2v\.plist(".*?Ronix VNG Install)/
            ],
            'skibx': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/pyzvF7\/pyzvF7\.plist(".*?Skibx Install)/,
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/peM8yI\/peM8yI\.plist(".*?Skibx VNG Install)/
            ]
        },
        'android': {
            'delta': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/v6sogoz9kn9iduw\/Delta-2\.716\.875\.apk\/file(".*?Delta Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/nopi33zoga9mfu1\/Delta-2\.711\.871-VN\.apk\/file(".*?Delta VNG Install)/
            ],
            'codex': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/4cadggxj7k5vktx\/Codex\+v2\.716\.apk\/file(".*?CODEX Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/3py7clwl1zxm5oo\/Codex\+V2\.710\.707\.apk\/file(".*?CODEX VNG Install)/
            ],
            'arceus': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/nli72kkxnkrh4g7\/Roblox\.-\.Arceus\.X\.v5\.1\.4\.2\.apk\/file(".*?Arceus X Neo Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/l8239o9vm625amg\/Roblox\.-\.VNG\.Arceus\.X\.v5\.1\.4\.2\.apk\/file(".*?Arceus X Neo VNG Install)/
            ],
            'ronix': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/cut0tioprp921tt\/Ronix_32Bits-2\.710\.707\.apk\/file(".*?Ronix Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/cut0tioprp921tt\/Ronix_32Bits-2\.710\.707\.apk\/file(".*?Ronix VNG Install)/
            ],
            'skibx': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/khh1d18x0sbdfc6\/SkibX-2\.707\.734\.apk\/file(".*?Skibx Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/khh1d18x0sbdfc6\/SkibX-2\.707\.734\.apk\/file(".*?Skibx VNG Install)/
            ],
            'cryptic': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/2cw9hn5kg5x1vk1\/Cryptic\.2\.689\.CrypticExecutor\.com\+\[rtxtop1\]\.apk\/file(".*?Cryptic Install)/,
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/2cw9hn5kg5x1vk1\/Cryptic\.2\.689\.CrypticExecutor\.com\+\[rtxtop1\]\.apk\/file(".*?Cryptic VNG Install)/
            ],
            'trigon': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/3b0k4ks6s1scwey\/Trigon_2\.716\.875\.apk\/file(".*?Trigon Install)/
            ],
            'vega': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/a1xkbytour4xksc\/Vega\.X\+8\.apk\/file(".*?Vega X Install)/
            ]
        },
        'pc': {
            'semo': [
                /(<a href=")https:\/\/www\.dropbox\.com\/scl\/fi\/ppuzmw1nqixti0t55r3y9\/Semo-Executor-v3\.50\.rar\?rlkey=nf99s3g8r9krjfcvwedxmgqwy&st=lt6s1bf9&dl=1(".*?Semo Install)/
            ],
            'velocity': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/f0egpgwh11qvtz5\/Velocity\.zip\/file(".*?Velocity Install)/
            ],
            'xeno': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/2ge30y7r9ufi9gt\/Xeno-v1\.3\.30\.zip\/file(".*?Xeno Install)/
            ],
            'ronix': [
                /(<a href=")https:\/\/wrdcdn\.net\/r\/154522\/1769203129478\/RonixInstaller_NEW\.exe(".*?Ronix Install)/
            ],
            'trigon': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/jwmwp9xhriyqkql\/Trigon_Evo_0\.2\.6\.exe\/file(".*?Trigon Install)/
            ]
        },
        'pekora-iphone': {
            '2017': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/HwcaUw\/HwcaUw\.plist(".*?Roblox 2017 Install)/
            ],
            '2018': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/phrr2u\/phrr2u\.plist(".*?Roblox 2018 Install)/
            ],
            '2020': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/wnJK0j\/wnJK0j\.plist(".*?Roblox 2020 Install)/
            ],
            '2021': [
                /(<a href=")itms-services:\/\/\?action=download-manifest&url=https:\/\/www\.installonair\.com\/storage\/ipaz\/McEPO8\/McEPO8\.plist(".*?Roblox 2021 Install)/
            ]
        },
        'pekora-android': {
            '2017-official': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/tzzl8frcvnem989\/Pekora2017L\.apk\/file(".*?Roblox 2017 Install \(رسمي\))/
            ],
            '2017-unofficial': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/ggz4eg6hnfx2sqq\/Korone_2017\.apk\/file(".*?Roblox 2017 Install \(غير رسمي\))/
            ],
            '2018': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/j713t6vbcx1fdbn\/Korone_2018\.apk\/file(".*?Roblox 2018 Install)/
            ],
            '2020': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/wvz6yi1144uu29i\/Korone_2020\.apk\/file(".*?Roblox 2020 Install)/
            ],
            '2021': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/bpu9bzv8a3hmfe1\/Korone_2021\.apk\/file(".*?Roblox 2021 Install)/
            ]
        },
        'pekora-pc': {
            '2017': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/kzadf87gvjyt6md\/PekoraStudio2017\+3\.zip\/file(".*?Roblox 2017 Install)/
            ],
            '2018': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/n4j9d8b33273dqg\/PekoraStudio2018\+2\.zip\/file(".*?Roblox 2018 Install)/
            ],
            '2020': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/dd71xq5h51198yj\/PekoraStudio2020\+2\.zip\/file(".*?Roblox 2020 Install)/
            ],
            '2021': [
                /(<a href=")https:\/\/www\.mediafire\.com\/file\/4jcde8p3eo91f4t\/PekoraStudio2021\+2\.zip\/file(".*?Roblox 2021 Install)/
            ]
        }
    };

    const platformPatterns = patterns[platform];
    if (!platformPatterns || !platformPatterns[normalized]) {
        throw new Error(`الهاك "${hackName}" غير مدعوم للمنصة "${platform}"`);
    }

    let result = html;
    const regexList = platformPatterns[normalized];
    const targetIdx = isVNG ? 1 : 0;
    if (regexList[targetIdx]) {
        result = result.replace(regexList[targetIdx], `$1${newUrl}$2`);
    }

    return result;
}

/**
 * تحديث حالة الهاك في الـ HTML
 * (يفترض وجود data-hack و data-platform في عناصر status-badge)
 */
function updateStatusInHTML(html, hackName, platform, status) {
    if (!html || !hackName || !platform || !status) {
        throw new Error('معاملات غير صحيحة');
    }

    const statusMap = {
        'يعمل':    { class: 'working',    icon: '✓', text: 'يعمل' },
        'لا يعمل': { class: 'not-working', icon: '✕', text: 'لا يعمل' },
        'قد يعمل': { class: 'maybe',      icon: '⚠', text: 'قد يعمل' }
    };
    const target = statusMap[status];
    if (!target) throw new Error(`حالة غير معروفة: ${status}`);

    // نبحث عن status-badge بالسمات المطابقة
    const regex = new RegExp(
        `(<span[^>]*class="[^"]*status-badge[^"]*"\\s+data-hack="${hackName}"\\s+data-platform="${platform}"[^>]*>)(.*?)(</span>)`,
        'gi'
    );
    const newContent = `<span class="status-text">${target.text}</span><span class="status-icon">${target.icon}</span>`;
    const result = html.replace(regex, `$1${newContent}$3`);

    // إذا لم يجد، حاول عن طريق النص العادي (fallback)
    if (result === html) {
        // محاولة البحث عن status-badge بدون السمات (تحديث أقل دقة)
        const fallbackRegex = new RegExp(
            `(<span[^>]*class="[^"]*status-badge[^"]*"[^>]*>)(.*?)(</span>)`,
            'gi'
        );
        // نبحث عن أقرب status-badge إلى اسم الهاك في العنوان (حل تقريبي)
        // لكن لن نعقد الأمور، نرمي خطأ
        throw new Error(`لم أجد الهاك "${hackName}" للمنصة "${platform}" في الـ HTML. تأكد من وجود data-hack و data-platform.`);
    }

    return result;
}

// ============= دوال GitHub =============

/**
 * حفظ الملف في GitHub
 */
async function saveToGitHub(filename, content, commitMessage, githubToken) {
    const octokit = new REST({ auth: githubToken });
    
    try {
        // محاولة جلب الملف الحالي للحصول على sha
        let sha = null;
        try {
            const current = await octokit.get(
                Routes.repos('RTX261', 'RTX', 'contents', filename)
            );
            sha = current.data.sha;
        } catch (e) {
            // الملف غير موجود، سننشئه
        }

        const base64Content = Buffer.from(content, 'utf8').toString('base64');
        const updateData = {
            message: commitMessage || `تحديث ${filename}`,
            content: base64Content,
            branch: 'main'
        };
        if (sha) updateData.sha = sha;

        await octokit.put(
            Routes.repos('RTX261', 'RTX', 'contents', filename),
            updateData
        );
        return { success: true };
    } catch (error) {
        console.error('❌ خطأ في حفظ الملف في GitHub:', error);
        throw error;
    }
}

/**
 * قراءة الملف من GitHub
 */
async function readFromGitHub(filename, githubToken) {
    const octokit = new REST({ auth: githubToken });
    
    try {
        const file = await octokit.get(
            Routes.repos('RTX261', 'RTX', 'contents', filename)
        );
        const content = Buffer.from(file.data.content, 'base64').toString('utf8');
        return { content, sha: file.data.sha };
    } catch (error) {
        console.error('❌ خطأ في قراءة الملف من GitHub:', error);
        throw error;
    }
}

module.exports = {
    HACK_CHOICES,
    VNG_SUPPORTED,
    updateLinkInHTML,
    updateStatusInHTML,
    saveToGitHub,
    readFromGitHub
};