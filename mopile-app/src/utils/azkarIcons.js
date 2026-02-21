/**
 * Maps Azkar category names to Ionicons icon names and gradient colors.
 * Fallback used for any unknown category.
 */
const AZKAR_ICON_MAP = [
    { keywords: ['صباح', 'الصباح', 'صبح'], icon: 'sunny', colors: ['#f59e0b', '#fbbf24'] },
    { keywords: ['مساء', 'المساء'], icon: 'partly-sunny', colors: ['#f97316', '#fb923c'] },
    { keywords: ['نوم', 'النوم', 'ليل', 'الليل'], icon: 'moon', colors: ['#6366f1', '#818cf8'] },
    { keywords: ['استيقاظ', 'الاستيقاظ'], icon: 'alarm', colors: ['#0ea5e9', '#38bdf8'] },
    { keywords: ['صلاة', 'الصلاة', 'صلوات'], icon: 'radio-button-on', colors: ['#10b981', '#34d399'] },
    { keywords: ['أذان', 'الأذان'], icon: 'volume-high', colors: ['#14b8a6', '#2dd4bf'] },
    { keywords: ['استخارة', 'الاستخارة'], icon: 'help-circle', colors: ['#8b5cf6', '#a78bfa'] },
    { keywords: ['قلق', 'الغم', 'الهم', 'ضائقة'], icon: 'heart-half', colors: ['#ec4899', '#f472b6'] },
    { keywords: ['طعام', 'الطعام', 'أكل'], icon: 'restaurant', colors: ['#d97706', '#fbbf24'] },
    { keywords: ['مسجد', 'المسجد'], icon: 'business', colors: ['#0d9488', '#2dd4bf'] },
    { keywords: ['استغفار', 'التوبة'], icon: 'refresh-circle', colors: ['#059669', '#34d399'] },
    { keywords: ['تسبيح', 'سبح'], icon: 'infinite', colors: ['#7c3aed', '#8b5cf6'] },
    { keywords: ['سفر', 'السفر'], icon: 'airplane', colors: ['#0284c7', '#38bdf8'] },
    { keywords: ['مطر', 'الريح'], icon: 'rainy', colors: ['#0369a1', '#0ea5e9'] },
    { keywords: ['ختم', 'القرآن'], icon: 'book', colors: ['#16a34a', '#4ade80'] },
    { keywords: ['دعاء', 'الدعاء', 'أدعية'], icon: 'chatbubble-ellipses', colors: ['#c026d3', '#e879f9'] },
    { keywords: ['كرب', 'الكرب'], icon: 'bandage', colors: ['#dc2626', '#f87171'] },
    { keywords: ['حمد', 'شكر'], icon: 'ribbon', colors: ['#ca8a04', '#facc15'] },
];

const DEFAULT = { icon: 'leaf', colors: ['#10b981', '#34d399'] };

/**
 * @param {string} categoryName  Arabic category name
 * @returns {{ icon: string, colors: string[] }}
 */
export function getAzkarMeta(categoryName) {
    const lower = categoryName || '';
    for (const entry of AZKAR_ICON_MAP) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return { icon: entry.icon, colors: entry.colors };
        }
    }
    return DEFAULT;
}
