type Paginated<Result extends object> = {
  page: number;
  total_pages: number;
  total_results: number;
  results: Result[];
};

export type AssetPath = null | `/${string}.${string}`;
type Genre = (typeof Genres)[number];
type IsoLanguageString = (typeof Langauges)[number]["iso_639_1"];
type DateString = `${number}-${number}-${number}`;
type CountryIsoStr = (typeof Countries)[number]["iso_3166_1"];
export type SearchResults = Paginated<
  | {
      media_type: "tv";
      id: number;
      adult: boolean;
      backdrop_path: AssetPath;
      name: string;
      original_name: string;
      overview: string;
      poster_path: AssetPath;
      original_language: IsoLanguageString;
      genre_ids: Genre["id"][];
      popularity: number;
      first_air_date: DateString;
      vote_average: number;
      vote_count: number;
      origin_country: CountryIsoStr[];
    }
  | {
      media_type: "movie";
      id: number;
      adult: boolean;
      backdrop_path: AssetPath;
      title: string;
      original_title: string;
      overview: string;
      poster_path: AssetPath;
      original_language: IsoLanguageString;
      genre_ids: Genre["id"][];
      popularity: number;
      release_date: DateString;
      vote_average: number;
      vote_count: number;
      video: boolean;
    }
  | {
      media_type: string & "other";
      id: number;
    }
>;
export class ApiError extends Error {
  public constructor(body: {
    success: false;
    status_code: number;
    status_message: string;
  }) {
    super(body.status_message, { cause: body });
  }
}

export const Genres = [
  // tv shows
  {
    id: 10759,
    name: "Action & Adventure",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Comedy",
  },
  {
    id: 80,
    name: "Crime",
  },
  {
    id: 99,
    name: "Documentary",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Family",
  },
  {
    id: 10762,
    name: "Kids",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10763,
    name: "News",
  },
  {
    id: 10764,
    name: "Reality",
  },
  {
    id: 10765,
    name: "Sci-Fi & Fantasy",
  },
  {
    id: 10766,
    name: "Soap",
  },
  {
    id: 10767,
    name: "Talk",
  },
  {
    id: 10768,
    name: "War & Politics",
  },
  {
    id: 37,
    name: "Western",
  },
  // movies
  {
    id: 28,
    name: "Action",
  },
  {
    id: 12,
    name: "Abenteuer",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Komödie",
  },
  {
    id: 80,
    name: "Krimi",
  },
  {
    id: 99,
    name: "Dokumentarfilm",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Familie",
  },
  {
    id: 14,
    name: "Fantasy",
  },
  {
    id: 36,
    name: "Historie",
  },
  {
    id: 27,
    name: "Horror",
  },
  {
    id: 10402,
    name: "Musik",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10749,
    name: "Liebesfilm",
  },
  {
    id: 878,
    name: "Science Fiction",
  },
  {
    id: 10770,
    name: "TV-Film",
  },
  {
    id: 53,
    name: "Thriller",
  },
  {
    id: 10752,
    name: "Kriegsfilm",
  },
  {
    id: 37,
    name: "Western",
  },
] as const;

export const AssetConfiguration = {
  base_url: "http://image.tmdb.org/t/p/",
  secure_base_url: "https://image.tmdb.org/t/p/",
  sizes: {
    backdrop: ["w300", "w780", "w1280", "original"],
    logo: ["w45", "w92", "w154", "w185", "w300", "w500", "original"],
    poster: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
    profile: ["w45", "w185", "h632", "original"],
    still: ["w92", "w185", "w300", "original"],
  },
} as const;
export type AssetSizes = (typeof AssetConfiguration)["sizes"];

const Langauges = [
  {
    iso_639_1: "bi",
    english_name: "Bislama",
    name: "",
  },
  {
    iso_639_1: "cs",
    english_name: "Czech",
    name: "Český",
  },
  {
    iso_639_1: "ba",
    english_name: "Bashkir",
    name: "",
  },
  {
    iso_639_1: "ae",
    english_name: "Avestan",
    name: "",
  },
  {
    iso_639_1: "av",
    english_name: "Avaric",
    name: "",
  },
  {
    iso_639_1: "de",
    english_name: "German",
    name: "Deutsch",
  },
  {
    iso_639_1: "mt",
    english_name: "Maltese",
    name: "Malti",
  },
  {
    iso_639_1: "om",
    english_name: "Oromo",
    name: "",
  },
  {
    iso_639_1: "rm",
    english_name: "Raeto-Romance",
    name: "",
  },
  {
    iso_639_1: "so",
    english_name: "Somali",
    name: "Somali",
  },
  {
    iso_639_1: "ts",
    english_name: "Tsonga",
    name: "",
  },
  {
    iso_639_1: "vi",
    english_name: "Vietnamese",
    name: "Tiếng Việt",
  },
  {
    iso_639_1: "gn",
    english_name: "Guarani",
    name: "",
  },
  {
    iso_639_1: "ig",
    english_name: "Igbo",
    name: "",
  },
  {
    iso_639_1: "it",
    english_name: "Italian",
    name: "Italiano",
  },
  {
    iso_639_1: "ki",
    english_name: "Kikuyu",
    name: "",
  },
  {
    iso_639_1: "ku",
    english_name: "Kurdish",
    name: "",
  },
  {
    iso_639_1: "la",
    english_name: "Latin",
    name: "Latin",
  },
  {
    iso_639_1: "ln",
    english_name: "Lingala",
    name: "",
  },
  {
    iso_639_1: "lb",
    english_name: "Letzeburgesch",
    name: "",
  },
  {
    iso_639_1: "ny",
    english_name: "Chichewa; Nyanja",
    name: "",
  },
  {
    iso_639_1: "pl",
    english_name: "Polish",
    name: "Polski",
  },
  {
    iso_639_1: "si",
    english_name: "Sinhalese",
    name: "සිංහල",
  },
  {
    iso_639_1: "to",
    english_name: "Tonga",
    name: "",
  },
  {
    iso_639_1: "az",
    english_name: "Azerbaijani",
    name: "Azərbaycan",
  },
  {
    iso_639_1: "ce",
    english_name: "Chechen",
    name: "",
  },
  {
    iso_639_1: "cu",
    english_name: "Slavic",
    name: "",
  },
  {
    iso_639_1: "da",
    english_name: "Danish",
    name: "Dansk",
  },
  {
    iso_639_1: "hz",
    english_name: "Herero",
    name: "",
  },
  {
    iso_639_1: "ie",
    english_name: "Interlingue",
    name: "",
  },
  {
    iso_639_1: "rw",
    english_name: "Kinyarwanda",
    name: "Kinyarwanda",
  },
  {
    iso_639_1: "mi",
    english_name: "Maori",
    name: "",
  },
  {
    iso_639_1: "no",
    english_name: "Norwegian",
    name: "Norsk",
  },
  {
    iso_639_1: "pi",
    english_name: "Pali",
    name: "",
  },
  {
    iso_639_1: "sk",
    english_name: "Slovak",
    name: "Slovenčina",
  },
  {
    iso_639_1: "se",
    english_name: "Northern Sami",
    name: "",
  },
  {
    iso_639_1: "sm",
    english_name: "Samoan",
    name: "",
  },
  {
    iso_639_1: "uk",
    english_name: "Ukrainian",
    name: "Український",
  },
  {
    iso_639_1: "en",
    english_name: "English",
    name: "English",
  },
  {
    iso_639_1: "ay",
    english_name: "Aymara",
    name: "",
  },
  {
    iso_639_1: "ca",
    english_name: "Catalan",
    name: "Català",
  },
  {
    iso_639_1: "eo",
    english_name: "Esperanto",
    name: "Esperanto",
  },
  {
    iso_639_1: "ha",
    english_name: "Hausa",
    name: "Hausa",
  },
  {
    iso_639_1: "ho",
    english_name: "Hiri Motu",
    name: "",
  },
  {
    iso_639_1: "hu",
    english_name: "Hungarian",
    name: "Magyar",
  },
  {
    iso_639_1: "io",
    english_name: "Ido",
    name: "",
  },
  {
    iso_639_1: "ii",
    english_name: "Yi",
    name: "",
  },
  {
    iso_639_1: "kn",
    english_name: "Kannada",
    name: "?????",
  },
  {
    iso_639_1: "kv",
    english_name: "Komi",
    name: "",
  },
  {
    iso_639_1: "li",
    english_name: "Limburgish",
    name: "",
  },
  {
    iso_639_1: "oj",
    english_name: "Ojibwa",
    name: "",
  },
  {
    iso_639_1: "ru",
    english_name: "Russian",
    name: "Pусский",
  },
  {
    iso_639_1: "sr",
    english_name: "Serbian",
    name: "Srpski",
  },
  {
    iso_639_1: "sv",
    english_name: "Swedish",
    name: "svenska",
  },
  {
    iso_639_1: "ty",
    english_name: "Tahitian",
    name: "",
  },
  {
    iso_639_1: "zu",
    english_name: "Zulu",
    name: "isiZulu",
  },
  {
    iso_639_1: "ka",
    english_name: "Georgian",
    name: "ქართული",
  },
  {
    iso_639_1: "ch",
    english_name: "Chamorro",
    name: "Finu' Chamorro",
  },
  {
    iso_639_1: "be",
    english_name: "Belarusian",
    name: "беларуская мова",
  },
  {
    iso_639_1: "br",
    english_name: "Breton",
    name: "",
  },
  {
    iso_639_1: "kw",
    english_name: "Cornish",
    name: "",
  },
  {
    iso_639_1: "fi",
    english_name: "Finnish",
    name: "suomi",
  },
  {
    iso_639_1: "sh",
    english_name: "Serbo-Croatian",
    name: "",
  },
  {
    iso_639_1: "nn",
    english_name: "Norwegian Nynorsk",
    name: "",
  },
  {
    iso_639_1: "tt",
    english_name: "Tatar",
    name: "",
  },
  {
    iso_639_1: "tg",
    english_name: "Tajik",
    name: "",
  },
  {
    iso_639_1: "vo",
    english_name: "Volapük",
    name: "",
  },
  {
    iso_639_1: "ps",
    english_name: "Pushto",
    name: "پښتو",
  },
  {
    iso_639_1: "mk",
    english_name: "Macedonian",
    name: "",
  },
  {
    iso_639_1: "fr",
    english_name: "French",
    name: "Français",
  },
  {
    iso_639_1: "bm",
    english_name: "Bambara",
    name: "Bamanankan",
  },
  {
    iso_639_1: "eu",
    english_name: "Basque",
    name: "euskera",
  },
  {
    iso_639_1: "fj",
    english_name: "Fijian",
    name: "",
  },
  {
    iso_639_1: "id",
    english_name: "Indonesian",
    name: "Bahasa indonesia",
  },
  {
    iso_639_1: "mg",
    english_name: "Malagasy",
    name: "",
  },
  {
    iso_639_1: "na",
    english_name: "Nauru",
    name: "",
  },
  {
    iso_639_1: "xx",
    english_name: "No Language",
    name: "No Language",
  },
  {
    iso_639_1: "qu",
    english_name: "Quechua",
    name: "",
  },
  {
    iso_639_1: "sq",
    english_name: "Albanian",
    name: "shqip",
  },
  {
    iso_639_1: "ti",
    english_name: "Tigrinya",
    name: "",
  },
  {
    iso_639_1: "tw",
    english_name: "Twi",
    name: "",
  },
  {
    iso_639_1: "wa",
    english_name: "Walloon",
    name: "",
  },
  {
    iso_639_1: "ab",
    english_name: "Abkhazian",
    name: "",
  },
  {
    iso_639_1: "bs",
    english_name: "Bosnian",
    name: "Bosanski",
  },
  {
    iso_639_1: "af",
    english_name: "Afrikaans",
    name: "Afrikaans",
  },
  {
    iso_639_1: "an",
    english_name: "Aragonese",
    name: "",
  },
  {
    iso_639_1: "fy",
    english_name: "Frisian",
    name: "",
  },
  {
    iso_639_1: "gu",
    english_name: "Gujarati",
    name: "",
  },
  {
    iso_639_1: "ik",
    english_name: "Inupiaq",
    name: "",
  },
  {
    iso_639_1: "ja",
    english_name: "Japanese",
    name: "日本語",
  },
  {
    iso_639_1: "ko",
    english_name: "Korean",
    name: "한국어/조선말",
  },
  {
    iso_639_1: "lg",
    english_name: "Ganda",
    name: "",
  },
  {
    iso_639_1: "nl",
    english_name: "Dutch",
    name: "Nederlands",
  },
  {
    iso_639_1: "os",
    english_name: "Ossetian; Ossetic",
    name: "",
  },
  {
    iso_639_1: "el",
    english_name: "Greek",
    name: "ελληνικά",
  },
  {
    iso_639_1: "bn",
    english_name: "Bengali",
    name: "বাংলা",
  },
  {
    iso_639_1: "cr",
    english_name: "Cree",
    name: "",
  },
  {
    iso_639_1: "km",
    english_name: "Khmer",
    name: "",
  },
  {
    iso_639_1: "lo",
    english_name: "Lao",
    name: "",
  },
  {
    iso_639_1: "nd",
    english_name: "Ndebele",
    name: "",
  },
  {
    iso_639_1: "ne",
    english_name: "Nepali",
    name: "",
  },
  {
    iso_639_1: "sc",
    english_name: "Sardinian",
    name: "",
  },
  {
    iso_639_1: "sw",
    english_name: "Swahili",
    name: "Kiswahili",
  },
  {
    iso_639_1: "tl",
    english_name: "Tagalog",
    name: "",
  },
  {
    iso_639_1: "ur",
    english_name: "Urdu",
    name: "اردو",
  },
  {
    iso_639_1: "ee",
    english_name: "Ewe",
    name: "Èʋegbe",
  },
  {
    iso_639_1: "aa",
    english_name: "Afar",
    name: "",
  },
  {
    iso_639_1: "co",
    english_name: "Corsican",
    name: "",
  },
  {
    iso_639_1: "et",
    english_name: "Estonian",
    name: "Eesti",
  },
  {
    iso_639_1: "is",
    english_name: "Icelandic",
    name: "Íslenska",
  },
  {
    iso_639_1: "ks",
    english_name: "Kashmiri",
    name: "",
  },
  {
    iso_639_1: "kr",
    english_name: "Kanuri",
    name: "",
  },
  {
    iso_639_1: "ky",
    english_name: "Kirghiz",
    name: "??????",
  },
  {
    iso_639_1: "kj",
    english_name: "Kuanyama",
    name: "",
  },
  {
    iso_639_1: "nr",
    english_name: "Ndebele",
    name: "",
  },
  {
    iso_639_1: "or",
    english_name: "Oriya",
    name: "",
  },
  {
    iso_639_1: "wo",
    english_name: "Wolof",
    name: "Wolof",
  },
  {
    iso_639_1: "za",
    english_name: "Zhuang",
    name: "",
  },
  {
    iso_639_1: "ar",
    english_name: "Arabic",
    name: "العربية",
  },
  {
    iso_639_1: "cv",
    english_name: "Chuvash",
    name: "",
  },
  {
    iso_639_1: "fo",
    english_name: "Faroese",
    name: "",
  },
  {
    iso_639_1: "hr",
    english_name: "Croatian",
    name: "Hrvatski",
  },
  {
    iso_639_1: "ms",
    english_name: "Malay",
    name: "Bahasa melayu",
  },
  {
    iso_639_1: "nb",
    english_name: "Norwegian Bokmål",
    name: "Bokmål",
  },
  {
    iso_639_1: "rn",
    english_name: "Rundi",
    name: "Kirundi",
  },
  {
    iso_639_1: "sn",
    english_name: "Shona",
    name: "",
  },
  {
    iso_639_1: "st",
    english_name: "Sotho",
    name: "",
  },
  {
    iso_639_1: "tr",
    english_name: "Turkish",
    name: "Türkçe",
  },
  {
    iso_639_1: "am",
    english_name: "Amharic",
    name: "",
  },
  {
    iso_639_1: "fa",
    english_name: "Persian",
    name: "فارسی",
  },
  {
    iso_639_1: "hy",
    english_name: "Armenian",
    name: "",
  },
  {
    iso_639_1: "pa",
    english_name: "Punjabi",
    name: "ਪੰਜਾਬੀ",
  },
  {
    iso_639_1: "as",
    english_name: "Assamese",
    name: "",
  },
  {
    iso_639_1: "ia",
    english_name: "Interlingua",
    name: "",
  },
  {
    iso_639_1: "lv",
    english_name: "Latvian",
    name: "Latviešu",
  },
  {
    iso_639_1: "lu",
    english_name: "Luba-Katanga",
    name: "",
  },
  {
    iso_639_1: "mr",
    english_name: "Marathi",
    name: "",
  },
  {
    iso_639_1: "mn",
    english_name: "Mongolian",
    name: "",
  },
  {
    iso_639_1: "pt",
    english_name: "Portuguese",
    name: "Português",
  },
  {
    iso_639_1: "th",
    english_name: "Thai",
    name: "ภาษาไทย",
  },
  {
    iso_639_1: "tk",
    english_name: "Turkmen",
    name: "",
  },
  {
    iso_639_1: "ve",
    english_name: "Venda",
    name: "",
  },
  {
    iso_639_1: "dv",
    english_name: "Divehi",
    name: "",
  },
  {
    iso_639_1: "gv",
    english_name: "Manx",
    name: "",
  },
  {
    iso_639_1: "kl",
    english_name: "Kalaallisut",
    name: "",
  },
  {
    iso_639_1: "kk",
    english_name: "Kazakh",
    name: "қазақ",
  },
  {
    iso_639_1: "lt",
    english_name: "Lithuanian",
    name: "Lietuvių",
  },
  {
    iso_639_1: "my",
    english_name: "Burmese",
    name: "",
  },
  {
    iso_639_1: "sl",
    english_name: "Slovenian",
    name: "Slovenščina",
  },
  {
    iso_639_1: "sd",
    english_name: "Sindhi",
    name: "",
  },
  {
    iso_639_1: "cn",
    english_name: "Cantonese",
    name: "广州话 / 廣州話",
  },
  {
    iso_639_1: "hi",
    english_name: "Hindi",
    name: "हिन्दी",
  },
  {
    iso_639_1: "cy",
    english_name: "Welsh",
    name: "Cymraeg",
  },
  {
    iso_639_1: "ht",
    english_name: "Haitian; Haitian Creole",
    name: "",
  },
  {
    iso_639_1: "iu",
    english_name: "Inuktitut",
    name: "",
  },
  {
    iso_639_1: "jv",
    english_name: "Javanese",
    name: "",
  },
  {
    iso_639_1: "mh",
    english_name: "Marshall",
    name: "",
  },
  {
    iso_639_1: "sa",
    english_name: "Sanskrit",
    name: "",
  },
  {
    iso_639_1: "ss",
    english_name: "Swati",
    name: "",
  },
  {
    iso_639_1: "te",
    english_name: "Telugu",
    name: "తెలుగు",
  },
  {
    iso_639_1: "kg",
    english_name: "Kongo",
    name: "",
  },
  {
    iso_639_1: "ml",
    english_name: "Malayalam",
    name: "",
  },
  {
    iso_639_1: "uz",
    english_name: "Uzbek",
    name: "ozbek",
  },
  {
    iso_639_1: "sg",
    english_name: "Sango",
    name: "",
  },
  {
    iso_639_1: "xh",
    english_name: "Xhosa",
    name: "",
  },
  {
    iso_639_1: "es",
    english_name: "Spanish",
    name: "Español",
  },
  {
    iso_639_1: "su",
    english_name: "Sundanese",
    name: "",
  },
  {
    iso_639_1: "ug",
    english_name: "Uighur",
    name: "",
  },
  {
    iso_639_1: "yi",
    english_name: "Yiddish",
    name: "",
  },
  {
    iso_639_1: "yo",
    english_name: "Yoruba",
    name: "Èdè Yorùbá",
  },
  {
    iso_639_1: "zh",
    english_name: "Mandarin",
    name: "普通话",
  },
  {
    iso_639_1: "he",
    english_name: "Hebrew",
    name: "עִבְרִית",
  },
  {
    iso_639_1: "bo",
    english_name: "Tibetan",
    name: "",
  },
  {
    iso_639_1: "ak",
    english_name: "Akan",
    name: "",
  },
  {
    iso_639_1: "mo",
    english_name: "Moldavian",
    name: "",
  },
  {
    iso_639_1: "ng",
    english_name: "Ndonga",
    name: "",
  },
  {
    iso_639_1: "dz",
    english_name: "Dzongkha",
    name: "",
  },
  {
    iso_639_1: "ff",
    english_name: "Fulah",
    name: "Fulfulde",
  },
  {
    iso_639_1: "gd",
    english_name: "Gaelic",
    name: "",
  },
  {
    iso_639_1: "ga",
    english_name: "Irish",
    name: "Gaeilge",
  },
  {
    iso_639_1: "gl",
    english_name: "Galician",
    name: "Galego",
  },
  {
    iso_639_1: "nv",
    english_name: "Navajo",
    name: "",
  },
  {
    iso_639_1: "oc",
    english_name: "Occitan",
    name: "",
  },
  {
    iso_639_1: "ro",
    english_name: "Romanian",
    name: "Română",
  },
  {
    iso_639_1: "ta",
    english_name: "Tamil",
    name: "தமிழ்",
  },
  {
    iso_639_1: "tn",
    english_name: "Tswana",
    name: "",
  },
  {
    iso_639_1: "bg",
    english_name: "Bulgarian",
    name: "български език",
  },
] as const;

const Countries = [
  {
    iso_3166_1: "AD",
    english_name: "Andorra",
    native_name: "Andorra",
  },
  {
    iso_3166_1: "AE",
    english_name: "United Arab Emirates",
    native_name: "United Arab Emirates",
  },
  {
    iso_3166_1: "AF",
    english_name: "Afghanistan",
    native_name: "Afghanistan",
  },
  {
    iso_3166_1: "AG",
    english_name: "Antigua and Barbuda",
    native_name: "Antigua & Barbuda",
  },
  {
    iso_3166_1: "AI",
    english_name: "Anguilla",
    native_name: "Anguilla",
  },
  {
    iso_3166_1: "AL",
    english_name: "Albania",
    native_name: "Albania",
  },
  {
    iso_3166_1: "AM",
    english_name: "Armenia",
    native_name: "Armenia",
  },
  {
    iso_3166_1: "AN",
    english_name: "Netherlands Antilles",
    native_name: "Netherlands Antilles",
  },
  {
    iso_3166_1: "AO",
    english_name: "Angola",
    native_name: "Angola",
  },
  {
    iso_3166_1: "AQ",
    english_name: "Antarctica",
    native_name: "Antarctica",
  },
  {
    iso_3166_1: "AR",
    english_name: "Argentina",
    native_name: "Argentina",
  },
  {
    iso_3166_1: "AS",
    english_name: "American Samoa",
    native_name: "American Samoa",
  },
  {
    iso_3166_1: "AT",
    english_name: "Austria",
    native_name: "Austria",
  },
  {
    iso_3166_1: "AU",
    english_name: "Australia",
    native_name: "Australia",
  },
  {
    iso_3166_1: "AW",
    english_name: "Aruba",
    native_name: "Aruba",
  },
  {
    iso_3166_1: "AZ",
    english_name: "Azerbaijan",
    native_name: "Azerbaijan",
  },
  {
    iso_3166_1: "BA",
    english_name: "Bosnia and Herzegovina",
    native_name: "Bosnia & Herzegovina",
  },
  {
    iso_3166_1: "BB",
    english_name: "Barbados",
    native_name: "Barbados",
  },
  {
    iso_3166_1: "BD",
    english_name: "Bangladesh",
    native_name: "Bangladesh",
  },
  {
    iso_3166_1: "BE",
    english_name: "Belgium",
    native_name: "Belgium",
  },
  {
    iso_3166_1: "BF",
    english_name: "Burkina Faso",
    native_name: "Burkina Faso",
  },
  {
    iso_3166_1: "BG",
    english_name: "Bulgaria",
    native_name: "Bulgaria",
  },
  {
    iso_3166_1: "BH",
    english_name: "Bahrain",
    native_name: "Bahrain",
  },
  {
    iso_3166_1: "BI",
    english_name: "Burundi",
    native_name: "Burundi",
  },
  {
    iso_3166_1: "BJ",
    english_name: "Benin",
    native_name: "Benin",
  },
  {
    iso_3166_1: "BM",
    english_name: "Bermuda",
    native_name: "Bermuda",
  },
  {
    iso_3166_1: "BN",
    english_name: "Brunei Darussalam",
    native_name: "Brunei",
  },
  {
    iso_3166_1: "BO",
    english_name: "Bolivia",
    native_name: "Bolivia",
  },
  {
    iso_3166_1: "BR",
    english_name: "Brazil",
    native_name: "Brazil",
  },
  {
    iso_3166_1: "BS",
    english_name: "Bahamas",
    native_name: "Bahamas",
  },
  {
    iso_3166_1: "BT",
    english_name: "Bhutan",
    native_name: "Bhutan",
  },
  {
    iso_3166_1: "BU",
    english_name: "Burma",
    native_name: "Burma",
  },
  {
    iso_3166_1: "BV",
    english_name: "Bouvet Island",
    native_name: "Bouvet Island",
  },
  {
    iso_3166_1: "BW",
    english_name: "Botswana",
    native_name: "Botswana",
  },
  {
    iso_3166_1: "BY",
    english_name: "Belarus",
    native_name: "Belarus",
  },
  {
    iso_3166_1: "BZ",
    english_name: "Belize",
    native_name: "Belize",
  },
  {
    iso_3166_1: "CA",
    english_name: "Canada",
    native_name: "Canada",
  },
  {
    iso_3166_1: "CC",
    english_name: "Cocos  Islands",
    native_name: "Cocos (Keeling) Islands",
  },
  {
    iso_3166_1: "CD",
    english_name: "Congo",
    native_name: "Democratic Republic of the Congo (Kinshasa)",
  },
  {
    iso_3166_1: "CF",
    english_name: "Central African Republic",
    native_name: "Central African Republic",
  },
  {
    iso_3166_1: "CG",
    english_name: "Congo",
    native_name: "Republic of the Congo (Brazzaville)",
  },
  {
    iso_3166_1: "CH",
    english_name: "Switzerland",
    native_name: "Switzerland",
  },
  {
    iso_3166_1: "CI",
    english_name: "Cote D'Ivoire",
    native_name: "Côte d’Ivoire",
  },
  {
    iso_3166_1: "CK",
    english_name: "Cook Islands",
    native_name: "Cook Islands",
  },
  {
    iso_3166_1: "CL",
    english_name: "Chile",
    native_name: "Chile",
  },
  {
    iso_3166_1: "CM",
    english_name: "Cameroon",
    native_name: "Cameroon",
  },
  {
    iso_3166_1: "CN",
    english_name: "China",
    native_name: "China",
  },
  {
    iso_3166_1: "CO",
    english_name: "Colombia",
    native_name: "Colombia",
  },
  {
    iso_3166_1: "CR",
    english_name: "Costa Rica",
    native_name: "Costa Rica",
  },
  {
    iso_3166_1: "CS",
    english_name: "Serbia and Montenegro",
    native_name: "Serbia and Montenegro",
  },
  {
    iso_3166_1: "CU",
    english_name: "Cuba",
    native_name: "Cuba",
  },
  {
    iso_3166_1: "CV",
    english_name: "Cape Verde",
    native_name: "Cape Verde",
  },
  {
    iso_3166_1: "CX",
    english_name: "Christmas Island",
    native_name: "Christmas Island",
  },
  {
    iso_3166_1: "CY",
    english_name: "Cyprus",
    native_name: "Cyprus",
  },
  {
    iso_3166_1: "CZ",
    english_name: "Czech Republic",
    native_name: "Czech Republic",
  },
  {
    iso_3166_1: "DE",
    english_name: "Germany",
    native_name: "Germany",
  },
  {
    iso_3166_1: "DJ",
    english_name: "Djibouti",
    native_name: "Djibouti",
  },
  {
    iso_3166_1: "DK",
    english_name: "Denmark",
    native_name: "Denmark",
  },
  {
    iso_3166_1: "DM",
    english_name: "Dominica",
    native_name: "Dominica",
  },
  {
    iso_3166_1: "DO",
    english_name: "Dominican Republic",
    native_name: "Dominican Republic",
  },
  {
    iso_3166_1: "DZ",
    english_name: "Algeria",
    native_name: "Algeria",
  },
  {
    iso_3166_1: "EC",
    english_name: "Ecuador",
    native_name: "Ecuador",
  },
  {
    iso_3166_1: "EE",
    english_name: "Estonia",
    native_name: "Estonia",
  },
  {
    iso_3166_1: "EG",
    english_name: "Egypt",
    native_name: "Egypt",
  },
  {
    iso_3166_1: "EH",
    english_name: "Western Sahara",
    native_name: "Western Sahara",
  },
  {
    iso_3166_1: "ER",
    english_name: "Eritrea",
    native_name: "Eritrea",
  },
  {
    iso_3166_1: "ES",
    english_name: "Spain",
    native_name: "Spain",
  },
  {
    iso_3166_1: "ET",
    english_name: "Ethiopia",
    native_name: "Ethiopia",
  },
  {
    iso_3166_1: "FI",
    english_name: "Finland",
    native_name: "Finland",
  },
  {
    iso_3166_1: "FJ",
    english_name: "Fiji",
    native_name: "Fiji",
  },
  {
    iso_3166_1: "FK",
    english_name: "Falkland Islands",
    native_name: "Falkland Islands",
  },
  {
    iso_3166_1: "FM",
    english_name: "Micronesia",
    native_name: "Micronesia",
  },
  {
    iso_3166_1: "FO",
    english_name: "Faeroe Islands",
    native_name: "Faroe Islands",
  },
  {
    iso_3166_1: "FR",
    english_name: "France",
    native_name: "France",
  },
  {
    iso_3166_1: "GA",
    english_name: "Gabon",
    native_name: "Gabon",
  },
  {
    iso_3166_1: "GB",
    english_name: "United Kingdom",
    native_name: "United Kingdom",
  },
  {
    iso_3166_1: "GD",
    english_name: "Grenada",
    native_name: "Grenada",
  },
  {
    iso_3166_1: "GE",
    english_name: "Georgia",
    native_name: "Georgia",
  },
  {
    iso_3166_1: "GF",
    english_name: "French Guiana",
    native_name: "French Guiana",
  },
  {
    iso_3166_1: "GH",
    english_name: "Ghana",
    native_name: "Ghana",
  },
  {
    iso_3166_1: "GI",
    english_name: "Gibraltar",
    native_name: "Gibraltar",
  },
  {
    iso_3166_1: "GL",
    english_name: "Greenland",
    native_name: "Greenland",
  },
  {
    iso_3166_1: "GM",
    english_name: "Gambia",
    native_name: "Gambia",
  },
  {
    iso_3166_1: "GN",
    english_name: "Guinea",
    native_name: "Guinea",
  },
  {
    iso_3166_1: "GP",
    english_name: "Guadaloupe",
    native_name: "Guadeloupe",
  },
  {
    iso_3166_1: "GQ",
    english_name: "Equatorial Guinea",
    native_name: "Equatorial Guinea",
  },
  {
    iso_3166_1: "GR",
    english_name: "Greece",
    native_name: "Greece",
  },
  {
    iso_3166_1: "GS",
    english_name: "South Georgia and the South Sandwich Islands",
    native_name: "South Georgia & South Sandwich Islands",
  },
  {
    iso_3166_1: "GT",
    english_name: "Guatemala",
    native_name: "Guatemala",
  },
  {
    iso_3166_1: "GU",
    english_name: "Guam",
    native_name: "Guam",
  },
  {
    iso_3166_1: "GW",
    english_name: "Guinea-Bissau",
    native_name: "Guinea-Bissau",
  },
  {
    iso_3166_1: "GY",
    english_name: "Guyana",
    native_name: "Guyana",
  },
  {
    iso_3166_1: "HK",
    english_name: "Hong Kong",
    native_name: "Hong Kong SAR China",
  },
  {
    iso_3166_1: "HM",
    english_name: "Heard and McDonald Islands",
    native_name: "Heard & McDonald Islands",
  },
  {
    iso_3166_1: "HN",
    english_name: "Honduras",
    native_name: "Honduras",
  },
  {
    iso_3166_1: "HR",
    english_name: "Croatia",
    native_name: "Croatia",
  },
  {
    iso_3166_1: "HT",
    english_name: "Haiti",
    native_name: "Haiti",
  },
  {
    iso_3166_1: "HU",
    english_name: "Hungary",
    native_name: "Hungary",
  },
  {
    iso_3166_1: "ID",
    english_name: "Indonesia",
    native_name: "Indonesia",
  },
  {
    iso_3166_1: "IE",
    english_name: "Ireland",
    native_name: "Ireland",
  },
  {
    iso_3166_1: "IL",
    english_name: "Israel",
    native_name: "Israel",
  },
  {
    iso_3166_1: "IN",
    english_name: "India",
    native_name: "India",
  },
  {
    iso_3166_1: "IO",
    english_name: "British Indian Ocean Territory",
    native_name: "British Indian Ocean Territory",
  },
  {
    iso_3166_1: "IQ",
    english_name: "Iraq",
    native_name: "Iraq",
  },
  {
    iso_3166_1: "IR",
    english_name: "Iran",
    native_name: "Iran",
  },
  {
    iso_3166_1: "IS",
    english_name: "Iceland",
    native_name: "Iceland",
  },
  {
    iso_3166_1: "IT",
    english_name: "Italy",
    native_name: "Italy",
  },
  {
    iso_3166_1: "JM",
    english_name: "Jamaica",
    native_name: "Jamaica",
  },
  {
    iso_3166_1: "JO",
    english_name: "Jordan",
    native_name: "Jordan",
  },
  {
    iso_3166_1: "JP",
    english_name: "Japan",
    native_name: "Japan",
  },
  {
    iso_3166_1: "KE",
    english_name: "Kenya",
    native_name: "Kenya",
  },
  {
    iso_3166_1: "KG",
    english_name: "Kyrgyz Republic",
    native_name: "Kyrgyzstan",
  },
  {
    iso_3166_1: "KH",
    english_name: "Cambodia",
    native_name: "Cambodia",
  },
  {
    iso_3166_1: "KI",
    english_name: "Kiribati",
    native_name: "Kiribati",
  },
  {
    iso_3166_1: "KM",
    english_name: "Comoros",
    native_name: "Comoros",
  },
  {
    iso_3166_1: "KN",
    english_name: "St. Kitts and Nevis",
    native_name: "St. Kitts & Nevis",
  },
  {
    iso_3166_1: "KP",
    english_name: "North Korea",
    native_name: "North Korea",
  },
  {
    iso_3166_1: "KR",
    english_name: "South Korea",
    native_name: "South Korea",
  },
  {
    iso_3166_1: "KW",
    english_name: "Kuwait",
    native_name: "Kuwait",
  },
  {
    iso_3166_1: "KY",
    english_name: "Cayman Islands",
    native_name: "Cayman Islands",
  },
  {
    iso_3166_1: "KZ",
    english_name: "Kazakhstan",
    native_name: "Kazakhstan",
  },
  {
    iso_3166_1: "LA",
    english_name: "Lao People's Democratic Republic",
    native_name: "Laos",
  },
  {
    iso_3166_1: "LB",
    english_name: "Lebanon",
    native_name: "Lebanon",
  },
  {
    iso_3166_1: "LC",
    english_name: "St. Lucia",
    native_name: "St. Lucia",
  },
  {
    iso_3166_1: "LI",
    english_name: "Liechtenstein",
    native_name: "Liechtenstein",
  },
  {
    iso_3166_1: "LK",
    english_name: "Sri Lanka",
    native_name: "Sri Lanka",
  },
  {
    iso_3166_1: "LR",
    english_name: "Liberia",
    native_name: "Liberia",
  },
  {
    iso_3166_1: "LS",
    english_name: "Lesotho",
    native_name: "Lesotho",
  },
  {
    iso_3166_1: "LT",
    english_name: "Lithuania",
    native_name: "Lithuania",
  },
  {
    iso_3166_1: "LU",
    english_name: "Luxembourg",
    native_name: "Luxembourg",
  },
  {
    iso_3166_1: "LV",
    english_name: "Latvia",
    native_name: "Latvia",
  },
  {
    iso_3166_1: "LY",
    english_name: "Libyan Arab Jamahiriya",
    native_name: "Libya",
  },
  {
    iso_3166_1: "MA",
    english_name: "Morocco",
    native_name: "Morocco",
  },
  {
    iso_3166_1: "MC",
    english_name: "Monaco",
    native_name: "Monaco",
  },
  {
    iso_3166_1: "MD",
    english_name: "Moldova",
    native_name: "Moldova",
  },
  {
    iso_3166_1: "ME",
    english_name: "Montenegro",
    native_name: "Montenegro",
  },
  {
    iso_3166_1: "MG",
    english_name: "Madagascar",
    native_name: "Madagascar",
  },
  {
    iso_3166_1: "MH",
    english_name: "Marshall Islands",
    native_name: "Marshall Islands",
  },
  {
    iso_3166_1: "MK",
    english_name: "Macedonia",
    native_name: "Macedonia",
  },
  {
    iso_3166_1: "ML",
    english_name: "Mali",
    native_name: "Mali",
  },
  {
    iso_3166_1: "MM",
    english_name: "Myanmar",
    native_name: "Myanmar (Burma)",
  },
  {
    iso_3166_1: "MN",
    english_name: "Mongolia",
    native_name: "Mongolia",
  },
  {
    iso_3166_1: "MO",
    english_name: "Macao",
    native_name: "Macau SAR China",
  },
  {
    iso_3166_1: "MP",
    english_name: "Northern Mariana Islands",
    native_name: "Northern Mariana Islands",
  },
  {
    iso_3166_1: "MQ",
    english_name: "Martinique",
    native_name: "Martinique",
  },
  {
    iso_3166_1: "MR",
    english_name: "Mauritania",
    native_name: "Mauritania",
  },
  {
    iso_3166_1: "MS",
    english_name: "Montserrat",
    native_name: "Montserrat",
  },
  {
    iso_3166_1: "MT",
    english_name: "Malta",
    native_name: "Malta",
  },
  {
    iso_3166_1: "MU",
    english_name: "Mauritius",
    native_name: "Mauritius",
  },
  {
    iso_3166_1: "MV",
    english_name: "Maldives",
    native_name: "Maldives",
  },
  {
    iso_3166_1: "MW",
    english_name: "Malawi",
    native_name: "Malawi",
  },
  {
    iso_3166_1: "MX",
    english_name: "Mexico",
    native_name: "Mexico",
  },
  {
    iso_3166_1: "MY",
    english_name: "Malaysia",
    native_name: "Malaysia",
  },
  {
    iso_3166_1: "MZ",
    english_name: "Mozambique",
    native_name: "Mozambique",
  },
  {
    iso_3166_1: "NA",
    english_name: "Namibia",
    native_name: "Namibia",
  },
  {
    iso_3166_1: "NC",
    english_name: "New Caledonia",
    native_name: "New Caledonia",
  },
  {
    iso_3166_1: "NE",
    english_name: "Niger",
    native_name: "Niger",
  },
  {
    iso_3166_1: "NF",
    english_name: "Norfolk Island",
    native_name: "Norfolk Island",
  },
  {
    iso_3166_1: "NG",
    english_name: "Nigeria",
    native_name: "Nigeria",
  },
  {
    iso_3166_1: "NI",
    english_name: "Nicaragua",
    native_name: "Nicaragua",
  },
  {
    iso_3166_1: "NL",
    english_name: "Netherlands",
    native_name: "Netherlands",
  },
  {
    iso_3166_1: "NO",
    english_name: "Norway",
    native_name: "Norway",
  },
  {
    iso_3166_1: "NP",
    english_name: "Nepal",
    native_name: "Nepal",
  },
  {
    iso_3166_1: "NR",
    english_name: "Nauru",
    native_name: "Nauru",
  },
  {
    iso_3166_1: "NU",
    english_name: "Niue",
    native_name: "Niue",
  },
  {
    iso_3166_1: "NZ",
    english_name: "New Zealand",
    native_name: "New Zealand",
  },
  {
    iso_3166_1: "OM",
    english_name: "Oman",
    native_name: "Oman",
  },
  {
    iso_3166_1: "PA",
    english_name: "Panama",
    native_name: "Panama",
  },
  {
    iso_3166_1: "PE",
    english_name: "Peru",
    native_name: "Peru",
  },
  {
    iso_3166_1: "PF",
    english_name: "French Polynesia",
    native_name: "French Polynesia",
  },
  {
    iso_3166_1: "PG",
    english_name: "Papua New Guinea",
    native_name: "Papua New Guinea",
  },
  {
    iso_3166_1: "PH",
    english_name: "Philippines",
    native_name: "Philippines",
  },
  {
    iso_3166_1: "PK",
    english_name: "Pakistan",
    native_name: "Pakistan",
  },
  {
    iso_3166_1: "PL",
    english_name: "Poland",
    native_name: "Poland",
  },
  {
    iso_3166_1: "PM",
    english_name: "St. Pierre and Miquelon",
    native_name: "St. Pierre & Miquelon",
  },
  {
    iso_3166_1: "PN",
    english_name: "Pitcairn Island",
    native_name: "Pitcairn Islands",
  },
  {
    iso_3166_1: "PR",
    english_name: "Puerto Rico",
    native_name: "Puerto Rico",
  },
  {
    iso_3166_1: "PS",
    english_name: "Palestinian Territory",
    native_name: "Palestinian Territories",
  },
  {
    iso_3166_1: "PT",
    english_name: "Portugal",
    native_name: "Portugal",
  },
  {
    iso_3166_1: "PW",
    english_name: "Palau",
    native_name: "Palau",
  },
  {
    iso_3166_1: "PY",
    english_name: "Paraguay",
    native_name: "Paraguay",
  },
  {
    iso_3166_1: "QA",
    english_name: "Qatar",
    native_name: "Qatar",
  },
  {
    iso_3166_1: "RE",
    english_name: "Reunion",
    native_name: "Réunion",
  },
  {
    iso_3166_1: "RO",
    english_name: "Romania",
    native_name: "Romania",
  },
  {
    iso_3166_1: "RS",
    english_name: "Serbia",
    native_name: "Serbia",
  },
  {
    iso_3166_1: "RU",
    english_name: "Russia",
    native_name: "Russia",
  },
  {
    iso_3166_1: "RW",
    english_name: "Rwanda",
    native_name: "Rwanda",
  },
  {
    iso_3166_1: "SA",
    english_name: "Saudi Arabia",
    native_name: "Saudi Arabia",
  },
  {
    iso_3166_1: "SB",
    english_name: "Solomon Islands",
    native_name: "Solomon Islands",
  },
  {
    iso_3166_1: "SC",
    english_name: "Seychelles",
    native_name: "Seychelles",
  },
  {
    iso_3166_1: "SD",
    english_name: "Sudan",
    native_name: "Sudan",
  },
  {
    iso_3166_1: "SE",
    english_name: "Sweden",
    native_name: "Sweden",
  },
  {
    iso_3166_1: "SG",
    english_name: "Singapore",
    native_name: "Singapore",
  },
  {
    iso_3166_1: "SH",
    english_name: "St. Helena",
    native_name: "St. Helena",
  },
  {
    iso_3166_1: "SI",
    english_name: "Slovenia",
    native_name: "Slovenia",
  },
  {
    iso_3166_1: "SJ",
    english_name: "Svalbard & Jan Mayen Islands",
    native_name: "Svalbard & Jan Mayen",
  },
  {
    iso_3166_1: "SK",
    english_name: "Slovakia",
    native_name: "Slovakia",
  },
  {
    iso_3166_1: "SL",
    english_name: "Sierra Leone",
    native_name: "Sierra Leone",
  },
  {
    iso_3166_1: "SM",
    english_name: "San Marino",
    native_name: "San Marino",
  },
  {
    iso_3166_1: "SN",
    english_name: "Senegal",
    native_name: "Senegal",
  },
  {
    iso_3166_1: "SO",
    english_name: "Somalia",
    native_name: "Somalia",
  },
  {
    iso_3166_1: "SR",
    english_name: "Suriname",
    native_name: "Suriname",
  },
  {
    iso_3166_1: "SS",
    english_name: "South Sudan",
    native_name: "South Sudan",
  },
  {
    iso_3166_1: "ST",
    english_name: "Sao Tome and Principe",
    native_name: "São Tomé & Príncipe",
  },
  {
    iso_3166_1: "SU",
    english_name: "Soviet Union",
    native_name: "Soviet Union",
  },
  {
    iso_3166_1: "SV",
    english_name: "El Salvador",
    native_name: "El Salvador",
  },
  {
    iso_3166_1: "SY",
    english_name: "Syrian Arab Republic",
    native_name: "Syria",
  },
  {
    iso_3166_1: "SZ",
    english_name: "Swaziland",
    native_name: "Eswatini (Swaziland)",
  },
  {
    iso_3166_1: "TC",
    english_name: "Turks and Caicos Islands",
    native_name: "Turks & Caicos Islands",
  },
  {
    iso_3166_1: "TD",
    english_name: "Chad",
    native_name: "Chad",
  },
  {
    iso_3166_1: "TF",
    english_name: "French Southern Territories",
    native_name: "French Southern Territories",
  },
  {
    iso_3166_1: "TG",
    english_name: "Togo",
    native_name: "Togo",
  },
  {
    iso_3166_1: "TH",
    english_name: "Thailand",
    native_name: "Thailand",
  },
  {
    iso_3166_1: "TJ",
    english_name: "Tajikistan",
    native_name: "Tajikistan",
  },
  {
    iso_3166_1: "TK",
    english_name: "Tokelau",
    native_name: "Tokelau",
  },
  {
    iso_3166_1: "TL",
    english_name: "Timor-Leste",
    native_name: "Timor-Leste",
  },
  {
    iso_3166_1: "TM",
    english_name: "Turkmenistan",
    native_name: "Turkmenistan",
  },
  {
    iso_3166_1: "TN",
    english_name: "Tunisia",
    native_name: "Tunisia",
  },
  {
    iso_3166_1: "TO",
    english_name: "Tonga",
    native_name: "Tonga",
  },
  {
    iso_3166_1: "TP",
    english_name: "East Timor",
    native_name: "East Timor",
  },
  {
    iso_3166_1: "TR",
    english_name: "Turkey",
    native_name: "Turkey",
  },
  {
    iso_3166_1: "TT",
    english_name: "Trinidad and Tobago",
    native_name: "Trinidad & Tobago",
  },
  {
    iso_3166_1: "TV",
    english_name: "Tuvalu",
    native_name: "Tuvalu",
  },
  {
    iso_3166_1: "TW",
    english_name: "Taiwan",
    native_name: "Taiwan",
  },
  {
    iso_3166_1: "TZ",
    english_name: "Tanzania",
    native_name: "Tanzania",
  },
  {
    iso_3166_1: "UA",
    english_name: "Ukraine",
    native_name: "Ukraine",
  },
  {
    iso_3166_1: "UG",
    english_name: "Uganda",
    native_name: "Uganda",
  },
  {
    iso_3166_1: "UM",
    english_name: "United States Minor Outlying Islands",
    native_name: "U.S. Outlying Islands",
  },
  {
    iso_3166_1: "US",
    english_name: "United States of America",
    native_name: "United States",
  },
  {
    iso_3166_1: "UY",
    english_name: "Uruguay",
    native_name: "Uruguay",
  },
  {
    iso_3166_1: "UZ",
    english_name: "Uzbekistan",
    native_name: "Uzbekistan",
  },
  {
    iso_3166_1: "VA",
    english_name: "Holy See",
    native_name: "Vatican City",
  },
  {
    iso_3166_1: "VC",
    english_name: "St. Vincent and the Grenadines",
    native_name: "St. Vincent & Grenadines",
  },
  {
    iso_3166_1: "VE",
    english_name: "Venezuela",
    native_name: "Venezuela",
  },
  {
    iso_3166_1: "VG",
    english_name: "British Virgin Islands",
    native_name: "British Virgin Islands",
  },
  {
    iso_3166_1: "VI",
    english_name: "US Virgin Islands",
    native_name: "U.S. Virgin Islands",
  },
  {
    iso_3166_1: "VN",
    english_name: "Vietnam",
    native_name: "Vietnam",
  },
  {
    iso_3166_1: "VU",
    english_name: "Vanuatu",
    native_name: "Vanuatu",
  },
  {
    iso_3166_1: "WF",
    english_name: "Wallis and Futuna Islands",
    native_name: "Wallis & Futuna",
  },
  {
    iso_3166_1: "WS",
    english_name: "Samoa",
    native_name: "Samoa",
  },
  {
    iso_3166_1: "XC",
    english_name: "Czechoslovakia",
    native_name: "Czechoslovakia",
  },
  {
    iso_3166_1: "XG",
    english_name: "East Germany",
    native_name: "East Germany",
  },
  {
    iso_3166_1: "XI",
    english_name: "Northern Ireland",
    native_name: "Northern Ireland",
  },
  {
    iso_3166_1: "XK",
    english_name: "Kosovo",
    native_name: "Kosovo",
  },
  {
    iso_3166_1: "YE",
    english_name: "Yemen",
    native_name: "Yemen",
  },
  {
    iso_3166_1: "YT",
    english_name: "Mayotte",
    native_name: "Mayotte",
  },
  {
    iso_3166_1: "YU",
    english_name: "Yugoslavia",
    native_name: "Yugoslavia",
  },
  {
    iso_3166_1: "ZA",
    english_name: "South Africa",
    native_name: "South Africa",
  },
  {
    iso_3166_1: "ZM",
    english_name: "Zambia",
    native_name: "Zambia",
  },
  {
    iso_3166_1: "ZR",
    english_name: "Zaire",
    native_name: "Zaire",
  },
  {
    iso_3166_1: "ZW",
    english_name: "Zimbabwe",
    native_name: "Zimbabwe",
  },
] as const;
