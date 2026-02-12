export type KanaType = "hiragana" | "katakana";

export type KanaCard = {
  id: string;
  kana: string;
  romaji: string;
  group: string; // "a","ka","sa","ta","na","ha","ma","ya","ra","wa","n"
  type: KanaType;
};

export const GROUPS = ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "n"] as const;

type Row = { kana: string; romaji: string; group: (typeof GROUPS)[number] };

function makeCards(rows: Row[], type: KanaType, prefix: string): KanaCard[] {
  return rows.map((r, idx) => ({
    id: `${prefix}-${idx}`,
    kana: r.kana,
    romaji: r.romaji,
    group: r.group,
    type,
  }));
}

/** 46 Hiragana (gojūon básico) */
const H: KanaCard[] = makeCards(
  [
    // a
    { kana: "あ", romaji: "a", group: "a" },
    { kana: "い", romaji: "i", group: "a" },
    { kana: "う", romaji: "u", group: "a" },
    { kana: "え", romaji: "e", group: "a" },
    { kana: "お", romaji: "o", group: "a" },

    // ka
    { kana: "か", romaji: "ka", group: "ka" },
    { kana: "き", romaji: "ki", group: "ka" },
    { kana: "く", romaji: "ku", group: "ka" },
    { kana: "け", romaji: "ke", group: "ka" },
    { kana: "こ", romaji: "ko", group: "ka" },

    // sa
    { kana: "さ", romaji: "sa", group: "sa" },
    { kana: "し", romaji: "shi", group: "sa" },
    { kana: "す", romaji: "su", group: "sa" },
    { kana: "せ", romaji: "se", group: "sa" },
    { kana: "そ", romaji: "so", group: "sa" },

    // ta
    { kana: "た", romaji: "ta", group: "ta" },
    { kana: "ち", romaji: "chi", group: "ta" },
    { kana: "つ", romaji: "tsu", group: "ta" },
    { kana: "て", romaji: "te", group: "ta" },
    { kana: "と", romaji: "to", group: "ta" },

    // na
    { kana: "な", romaji: "na", group: "na" },
    { kana: "に", romaji: "ni", group: "na" },
    { kana: "ぬ", romaji: "nu", group: "na" },
    { kana: "ね", romaji: "ne", group: "na" },
    { kana: "の", romaji: "no", group: "na" },

    // ha
    { kana: "は", romaji: "ha", group: "ha" },
    { kana: "ひ", romaji: "hi", group: "ha" },
    { kana: "ふ", romaji: "fu", group: "ha" },
    { kana: "へ", romaji: "he", group: "ha" },
    { kana: "ほ", romaji: "ho", group: "ha" },

    // ma
    { kana: "ま", romaji: "ma", group: "ma" },
    { kana: "み", romaji: "mi", group: "ma" },
    { kana: "む", romaji: "mu", group: "ma" },
    { kana: "め", romaji: "me", group: "ma" },
    { kana: "も", romaji: "mo", group: "ma" },

    // ya
    { kana: "や", romaji: "ya", group: "ya" },
    { kana: "ゆ", romaji: "yu", group: "ya" },
    { kana: "よ", romaji: "yo", group: "ya" },

    // ra
    { kana: "ら", romaji: "ra", group: "ra" },
    { kana: "り", romaji: "ri", group: "ra" },
    { kana: "る", romaji: "ru", group: "ra" },
    { kana: "れ", romaji: "re", group: "ra" },
    { kana: "ろ", romaji: "ro", group: "ra" },

    // wa (+ wo)
    { kana: "わ", romaji: "wa", group: "wa" },
    { kana: "を", romaji: "wo", group: "wa" },

    // n
    { kana: "ん", romaji: "n", group: "n" },
  ],
  "hiragana",
  "h"
);

/** 46 Katakana (gojūon básico) */
const K: KanaCard[] = makeCards(
  [
    // a
    { kana: "ア", romaji: "a", group: "a" },
    { kana: "イ", romaji: "i", group: "a" },
    { kana: "ウ", romaji: "u", group: "a" },
    { kana: "エ", romaji: "e", group: "a" },
    { kana: "オ", romaji: "o", group: "a" },

    // ka
    { kana: "カ", romaji: "ka", group: "ka" },
    { kana: "キ", romaji: "ki", group: "ka" },
    { kana: "ク", romaji: "ku", group: "ka" },
    { kana: "ケ", romaji: "ke", group: "ka" },
    { kana: "コ", romaji: "ko", group: "ka" },

    // sa
    { kana: "サ", romaji: "sa", group: "sa" },
    { kana: "シ", romaji: "shi", group: "sa" },
    { kana: "ス", romaji: "su", group: "sa" },
    { kana: "セ", romaji: "se", group: "sa" },
    { kana: "ソ", romaji: "so", group: "sa" },

    // ta
    { kana: "タ", romaji: "ta", group: "ta" },
    { kana: "チ", romaji: "chi", group: "ta" },
    { kana: "ツ", romaji: "tsu", group: "ta" },
    { kana: "テ", romaji: "te", group: "ta" },
    { kana: "ト", romaji: "to", group: "ta" },

    // na
    { kana: "ナ", romaji: "na", group: "na" },
    { kana: "ニ", romaji: "ni", group: "na" },
    { kana: "ヌ", romaji: "nu", group: "na" },
    { kana: "ネ", romaji: "ne", group: "na" },
    { kana: "ノ", romaji: "no", group: "na" },

    // ha
    { kana: "ハ", romaji: "ha", group: "ha" },
    { kana: "ヒ", romaji: "hi", group: "ha" },
    { kana: "フ", romaji: "fu", group: "ha" },
    { kana: "ヘ", romaji: "he", group: "ha" },
    { kana: "ホ", romaji: "ho", group: "ha" },

    // ma
    { kana: "マ", romaji: "ma", group: "ma" },
    { kana: "ミ", romaji: "mi", group: "ma" },
    { kana: "ム", romaji: "mu", group: "ma" },
    { kana: "メ", romaji: "me", group: "ma" },
    { kana: "モ", romaji: "mo", group: "ma" },

    // ya
    { kana: "ヤ", romaji: "ya", group: "ya" },
    { kana: "ユ", romaji: "yu", group: "ya" },
    { kana: "ヨ", romaji: "yo", group: "ya" },

    // ra
    { kana: "ラ", romaji: "ra", group: "ra" },
    { kana: "リ", romaji: "ri", group: "ra" },
    { kana: "ル", romaji: "ru", group: "ra" },
    { kana: "レ", romaji: "re", group: "ra" },
    { kana: "ロ", romaji: "ro", group: "ra" },

    // wa (+ wo)
    { kana: "ワ", romaji: "wa", group: "wa" },
    { kana: "ヲ", romaji: "wo", group: "wa" },

    // n
    { kana: "ン", romaji: "n", group: "n" },
  ],
  "katakana",
  "k"
);

export function getCards(type: KanaType, groups: string[]): KanaCard[] {
  const base = type === "hiragana" ? H : K;
  const set = new Set(groups);
  return base.filter((c) => set.has(c.group));
}
