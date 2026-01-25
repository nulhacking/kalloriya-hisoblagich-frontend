interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicy = ({ isOpen, onClose }: PrivacyPolicyProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-food-green-500 to-food-green-600 p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span>🔒</span>
            Maxfiylik siyosati
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Yopish"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-80px)] text-food-brown-700">
          <p className="text-sm text-food-brown-500 mb-4">
            Oxirgi yangilanish: 2026-yil yanvar
          </p>

          <section className="mb-6">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>📋</span> Kirish
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              Kaloriya Hisoblagich ilovasiga xush kelibsiz. Biz sizning
              maxfiyligingizni hurmat qilamiz va shaxsiy ma'lumotlaringizni
              himoya qilishga intilamiz. Ushbu Maxfiylik siyosati ilovamizdan
              foydalanganingizda ma'lumotlaringizni qanday to'plashimiz,
              ishlatishimiz va himoya qilishimizni tushuntiradi.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>📷</span> Biz to'playdigan ma'lumotlar
            </h3>
            <div className="space-y-3 text-sm md:text-base">
              <div className="bg-food-green-50 rounded-xl p-3 border border-food-green-100">
                <h4 className="font-semibold text-food-green-800 mb-1">
                  Rasmlar
                </h4>
                <p className="text-food-brown-600">
                  Siz yuklagan ovqat rasmlari faqat kaloriya tahlili uchun
                  ishlatiladi. Rasmlar serverimizda doimiy saqlanmaydi va tahlil
                  tugagandan so'ng o'chiriladi.
                </p>
              </div>
              <div className="bg-food-yellow-50 rounded-xl p-3 border border-food-yellow-100">
                <h4 className="font-semibold text-food-yellow-800 mb-1">
                  Qurilma ma'lumotlari
                </h4>
                <p className="text-food-brown-600">
                  Ilovaning to'g'ri ishlashi uchun asosiy qurilma ma'lumotlari
                  (brauzer turi, ekran o'lchami) yig'ilishi mumkin.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>🎯</span> Ma'lumotlardan foydalanish
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-2">
              To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-food-brown-600 ml-2">
              <li>Ovqat rasmlarini tahlil qilish va kaloriya hisoblash</li>
              <li>Ilova xizmatlarini takomillashtirish</li>
              <li>Texnik muammolarni aniqlash va tuzatish</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>🔐</span> Ma'lumotlar xavfsizligi
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              Biz sizning ma'lumotlaringizni himoya qilish uchun sanoat
              standartlaridagi xavfsizlik choralaridan foydalanamiz. Barcha
              ma'lumotlar shifrlangan aloqa (HTTPS) orqali uzatiladi.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>🚫</span> Biz nima qilmaymiz
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-food-brown-600 ml-2">
              <li>Shaxsiy ma'lumotlaringizni uchinchi shaxslarga sotmaymiz</li>
              <li>Rasmlaringizni doimiy saqlamaymiz</li>
              <li>Reklama maqsadlarida ma'lumot to'plamaymiz</li>
              <li>Sizning roziligisiz ma'lumot ulashmaymiz</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>📝</span> Siyosat o'zgarishlari
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              Biz vaqti-vaqti bilan ushbu Maxfiylik siyosatini yangilashimiz
              mumkin. O'zgarishlar ilovada e'lon qilinadi va yangi siyosat
              darhol kuchga kiradi.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="text-lg font-bold text-food-green-700 mb-2 flex items-center gap-2">
              <span>📧</span> Bog'lanish
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              Maxfiylik siyosati haqida savollaringiz bo'lsa, biz bilan
              bog'laning:
            </p>
            <p className="mt-2 text-food-green-600 font-medium">
              📧 murodullohcholiyav@gmail.com
            </p>
          </section>

          {/* Close button */}
          <div className="mt-6 pt-4 border-t border-food-green-100">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg active:scale-95"
            >
              Tushundim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
