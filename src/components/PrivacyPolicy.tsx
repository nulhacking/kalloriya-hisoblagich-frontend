import BottomSheet from "./BottomSheet";

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const Section = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-5">
    <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-2">
      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
        {icon}
      </span>
      {title}
    </h3>
    <div className="text-sm text-stone-700 leading-relaxed pl-1">
      {children}
    </div>
  </section>
);

const PrivacyPolicy = ({ isOpen, onClose }: PrivacyPolicyProps) => {
  return (
    <BottomSheet
      open={isOpen}
      onClose={onClose}
      title="Maxfiylik siyosati"
      icon="🔒"
      accent="green"
      heroHeader
      maxHeight="max-h-[92vh]"
      footer={
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>✓</span>
          <span>Tushundim</span>
        </button>
      }
    >
      <div className="pt-3">
        <p className="text-xs text-stone-500 mb-4 italic">
          Oxirgi yangilanish: 2026-yil yanvar
        </p>

        <Section icon="📋" title="Kirish">
          Kaloriya Hisoblagich ilovasiga xush kelibsiz. Biz sizning maxfiyligingizni
          hurmat qilamiz va shaxsiy ma'lumotlaringizni himoya qilishga
          intilamiz.
        </Section>

        <Section icon="📷" title="Biz to'playdigan ma'lumotlar">
          <div className="space-y-2.5">
            <div className="bg-white rounded-xl p-3 border border-stone-200">
              <h4 className="font-semibold text-emerald-700 mb-1 text-sm">
                📸 Rasmlar
              </h4>
              <p className="text-stone-700 text-sm">
                Ovqat rasmlari faqat AI tahlili uchun ishlatiladi va
                serverimizda doimiy saqlanmaydi.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <h4 className="font-semibold text-amber-700 mb-1 text-sm">
                💻 Qurilma ma'lumotlari
              </h4>
              <p className="text-stone-700 text-sm">
                Faqat ilovaning to'g'ri ishlashi uchun minimal texnik
                ma'lumotlar.
              </p>
            </div>
          </div>
        </Section>

        <Section icon="🎯" title="Ma'lumotlardan foydalanish">
          <ul className="list-disc list-inside space-y-1 marker:text-emerald-700">
            <li>Ovqat rasmlarini tahlil qilish va kaloriya hisoblash</li>
            <li>Ilova xizmatlarini takomillashtirish</li>
            <li>Texnik muammolarni aniqlash va tuzatish</li>
          </ul>
        </Section>

        <Section icon="🔐" title="Xavfsizlik">
          Barcha ma'lumotlar shifrlangan HTTPS aloqa orqali uzatiladi.
          Parollar bcrypt bilan hash qilinadi.
        </Section>

        <Section icon="🚫" title="Biz nima qilmaymiz">
          <ul className="list-disc list-inside space-y-1 marker:text-red-600">
            <li>Ma'lumotlaringizni uchinchi shaxslarga sotmaymiz</li>
            <li>Rasmlaringizni doimiy saqlamaymiz</li>
            <li>Reklama maqsadlarida ma'lumot to'plamaymiz</li>
            <li>Sizning roziligisiz ma'lumot ulashmaymiz</li>
          </ul>
        </Section>

        <Section icon="📧" title="Bog'lanish">
          <p>Savollar bo'lsa, biz bilan bog'laning:</p>
          <a
            href="mailto:murodullohcholiyav@gmail.com"
            className="inline-block mt-2 text-emerald-700 font-semibold underline underline-offset-2"
          >
            murodullohcholiyav@gmail.com
          </a>
        </Section>
      </div>
    </BottomSheet>
  );
};

export default PrivacyPolicy;
