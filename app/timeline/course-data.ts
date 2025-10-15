export type CourseUnit = {
  code: string;
  slug: string;
  title: string;
  summary: string;
  topics: string[];
};

export type CourseLevel = {
  level: "A1" | "A2" | "B1" | "B2";
  label: string;
  description: string;
  units: CourseUnit[];
};

export const COURSE_PATH: CourseLevel[] = [
  {
    level: "A1",
    label: "Başlangıç Seviyesi",
    description:
      "Temel ifadeler, tanışma ve günlük ihtiyaçları karşılayacak yapılarla ilk adımlar.",
    units: [
      {
        code: "A1.1",
        slug: "a1-1",
        title: "İlk Karşılama",
        summary: "Temel selamlaşma kalıpları ve günlük ifadelerle tanış.",
        topics: [
          "Selamlaşma ve vedalaşma cümleleri",
          "Kendini tanıtma ve isim sorma",
          "Ülkeler ve milliyetleri söyleme",
          "Yaş ve doğum günü hakkında konuşma",
          "Basit sorular sorma (Wer, Was, Wo)",
          "Alfabe ve harfleri kodlama",
          "Meslekler ve günlük işler",
          "Aile bireylerini tanıtma",
          "Eşyaları ve renkleri betimleme",
          "Sayılar 0-100 arası",
          "Günler ve aylar",
          "Saat sorma ve söyleme",
          "Günlük rutinleri anlatma",
          "Basit istek ve rica cümleleri",
          "Kelimelerin cinsiyeti ve artikeller",
          "Belirtili ve belirsiz artikeller",
          "Temel fiiller (sein, haben, wohnen)",
          "Olumlu ve olumsuz cümle kurma",
          "Sınıfta kullanılan ifadeler",
          "Dinleme ve tekrar etme egzersizleri",
        ],
      },
      {
        code: "A1.2",
        slug: "a1-2",
        title: "Günlük Hayat",
        summary: "Alışveriş, zaman ve temel ihtiyaçlarla iletişim kurmayı öğren.",
        topics: [
          "Alışveriş kalıpları ve fiyat sorma",
          "Yiyecek-içecek isimleri",
          "Restoranda sipariş verme",
        ],
      },
    ],
  },
  {
    level: "A2",
    label: "Temel İletişim",
    description:
      "Günlük yaşam, seyahat ve sosyal etkileşimlerde daha rahat iletişim kurma.",
    units: [
      {
        code: "A2.1",
        slug: "a2-1",
        title: "Sosyal Bağlantılar",
        summary: "Duygularını ifade et ve kişisel deneyimlerini paylaş.",
        topics: [
          "Duygu ve düşünce ifade etme",
          "Aile ve arkadaş ilişkileri",
          "Basit geçmiş zaman kullanımı",
        ],
      },
      {
        code: "A2.2",
        slug: "a2-2",
        title: "Şehirde Yaşam",
        summary:
          "Şehirde dolaş, yön tarif et ve seyahat planlarını anlat.",
        topics: [
          "Ulaşım araçları ve bilet alma",
          "Restoran ve otel rezervasyonu",
          "Yön tarifleri ve öneriler",
        ],
      },
    ],
  },
  {
    level: "B1",
    label: "Orta Seviye",
    description:
      "Fikirlerini açıklama, deneyimlerini anlatma ve planlarını detaylandırma.",
    units: [
      {
        code: "B1.1",
        slug: "b1-1",
        title: "Anlatımlar",
        summary: "Geçmiş deneyimlerini paylaş ve sebep-sonuç ilişkileri kur.",
        topics: [
          "Geçmiş zaman hikayeleri",
          "Sebep ve sonuç anlatma",
          "Güncel haberleri tartışma",
        ],
      },
      {
        code: "B1.2",
        slug: "b1-2",
        title: "Planlar ve Hedefler",
        summary: "Gelecek planlarını ifade et ve tercihlerini karşılaştır.",
        topics: [
          "Modal fiillerle gelecek planları",
          "Hobiler ve ilgi alanları",
          "Karşılaştırmalar ve tercihler",
        ],
      },
    ],
  },
  {
    level: "B2",
    label: "Üst Orta Seviye",
    description:
      "Soyut konuları tartışma, görüşlerini savunma ve kapsamlı anlatımlar yapma.",
    units: [
      {
        code: "B2.1",
        slug: "b2-1",
        title: "Derin Sohbetler",
        summary: "Görüşlerini savun ve karmaşık konuları tartış.",
        topics: [
          "Argüman geliştirme",
          "Tartışma kalıpları",
          "Metin analizi ve özetleme",
        ],
      },
      {
        code: "B2.2",
        slug: "b2-2",
        title: "Uzmanlaşma",
        summary:
          "Profesyonel sunumlar yap ve akademik dilde ustalaş.",
        topics: [
          "Akademik kelime dağarcığı",
          "Şart cümleleri ve karmaşık yapılar",
          "Sunum ve rapor dili",
        ],
      },
    ],
  },
];

export function findUnitBySlug(slug: string) {
  for (const level of COURSE_PATH) {
    const unit = level.units.find((item) => item.slug === slug);
    if (unit) {
      return { level, unit };
    }
  }
  return null;
}
