# PROJE HAFIZASI VE GELİŞTİRME KURALLARI

## 1. Proje Özeti & Teknoloji Yığını
- **Proje Tanımı:** [Projenin 1-2 cümlelik kısa tanımı]
- **Frontend:** [Örn: Next.js 14 (App Router), TypeScript, Tailwind CSS]
- **Backend / DB:** [Örn: Spring Boot / Supabase, PostgreSQL]
- **Önemli Paketler:** [Örn: Lucide-react, Prisma, Zod, Axios]

## 2. Mimari Kurallar & Çalışma Prensibi
- **Kod Yapısı:** Controller / Service / Repository mimarisine sadık kal. İş mantığını (business logic) asla Controller veya Component içinde bırakma.
- **Güvenlik:** API anahtarlarını, şifreleri ve hassas verileri asla koda hardcode etme; her zaman `.env` kullan.
- **Dil:** Kod yorum satırları ve dokümantasyon dili **Türkçe** olmalıdır. Değişken ve fonksiyon isimleri **İngilizce** olmalıdır.

## 3. Kodlama ve Refactor Standartları
- TypeScript kullanılıyorsa `any` tipini asla kullanma, type/interface tanımla.
- Tek bir fonksiyon veya component 150 satırı geçmemelidir; gerekirse modüler parçalara böl.
- Kodu değiştirmeden önce ilgili dosyaları tamamen oku ve var olan yapıyı bozma.

## 4. Hermes Çalışma Protokolü (Çok Önemli!)
1. **Önce Planla:** Karmaşık bir kod yazmadan veya `patch` uygulamadan önce yapacağın değişiklikleri adımla açıkla ve onayımı bekle.
2. **Kendi Kendine Test Et:** Kod değişikliği yaptıktan sonra imkan varsa terminalde derleme/test komutunu çalıştırarak hata alıp almadığını kontrol et. Hata varsa kendin ayıkla (debug).