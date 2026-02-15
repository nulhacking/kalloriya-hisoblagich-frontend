# Optimistic Updates - Implementatsiya

Bu loyihaga **Optimistic Updates** funksiyasi qo'shildi. Bu funksiya foydalanuvchi tajribasini sezilarli darajada yaxshilaydi va ilovaning tezligini oshiradi.

## 📋 Nima qilindi?

### 1. **Meals (Ovqatlar) uchun Optimistic Update**

#### Fayl: `src/hooks/useMeals.ts`

**`useAddMeal` hook:**
- Yangi ovqat qo'shilganda, UI darhol yangilanadi (server javobini kutmaydi)
- Agar server xatolik qaytarsa, o'zgarishlar avtomatik bekor qilinadi
- `onMutate`: Vaqtinchalik ovqat yaratiladi va UI'ga qo'shiladi
- `onError`: Xatolik yuz berganda oldingi holatga qaytariladi
- `onSettled`: Har qanday holatda ham server bilan sinxronlanadi

**`useDeleteMeal` hook:**
- Ovqat o'chirilganda, UI dan darhol olib tashlanadi
- Server javobini kutmaydi
- Xatolik bo'lsa, ovqat qaytarib tiklanadi

### 2. **Activities (Harakatlar) uchun Optimistic Update**

#### Yangi fayl: `src/hooks/useActivities.ts`

**`useAddActivity` hook:**
- Harakat qo'shilganda darhol UI'da ko'rinadi
- Vaqtinchalik harakat yaratiladi
- Server javobini kutmaydi

**`useAddCustomActivity` hook:**
- Custom harakat qo'shish uchun optimistic update

**`useDeleteActivity` hook:**
- Harakat o'chirilganda darhol UI'dan olib tashlanadi
- Xatolik bo'lsa, harakat qaytarib tiklanadi

#### O'zgartirilgan fayl: `src/components/ActivityPicker.tsx`
- `useAddActivity` hook ishlatiladi
- `submitting` o'rniga `addActivityMutation.isPending` ishlatiladi
- Token to'g'ridan-to'g'ri ishlatilmaydi (hook ichida boshqariladi)

### 3. **Feedback uchun Optimistic Update**

#### Yangi fayl: `src/hooks/useFeedback.ts`

**`useMyFeedbacks` hook:**
- Foydalanuvchining feedbacklarini olish

**`useSubmitFeedback` hook:**
- Yangi feedback yuborilganda darhol ro'yxatga qo'shiladi
- Server javobini kutmaydi
- Xatolik bo'lsa, feedback olib tashlanadi

#### O'zgartirilgan fayl: `src/components/Feedback.tsx`
- React Query hooks ishlatiladi
- State management soddalashtirildi
- `submitFeedbackMutation.isPending` orqali loading holati kuzatiladi

### 4. **User Settings uchun Optimistic Update**

#### Yangi fayl: `src/hooks/useUserSettings.ts`

**`useUpdateUserSettings` hook:**
- Sozlamalar o'zgartirilganda darhol Zustand store'da yangilanadi
- Server javobini kutmaydi
- Xatolik bo'lsa, oldingi sozlamalarga qaytariladi

#### O'zgartirilgan fayl: `src/pages/SettingsPage.tsx`
- `useUpdateUserSettings` hook ishlatiladi
- Zustand store'dan to'g'ridan-to'g'ri `updateSettings` chaqirilmaydi

## 🚀 Foydalanish afzalliklari

### 1. **Tezlik**
- Foydalanuvchi amallarni bajarganida, natija darhol ko'rinadi
- Server javobini kutish kerak emas
- UX sezilarli darajada yaxshilanadi

### 2. **Ishonchlilik**
- Agar xatolik yuz bersa, avtomatik rollback amalga oshiriladi
- Foydalanuvchi o'zgarishlar saqlanmaganligini ko'radi
- Ma'lumotlar to'g'riligi saqlanadi

### 3. **Offline-first tajriba**
- Foydalanuvchi amallarni bajarishi mumkin (server kutilmaydi)
- Keyinchalik server bilan sinxronlanadi
- Mobil tarmoqlarda yaxshi ishlaydi

### 4. **Kod sifati**
- Har bir mutation alohida hook'da
- Qayta ishlatish oson
- Test qilish oson

## 📊 React Query konfiguratsiyasi

### Fayl: `src/lib/queryClient.ts`

```typescript
staleTime: 5 * 60 * 1000,  // 5 daqiqa - cache muddati
gcTime: 10 * 60 * 1000,     // 10 daqiqa - garbage collection
retry: 1,                    // 1 marta retry
networkMode: "offlineFirst", // Offline-first strategiya
```

## 🔄 Ishlash prinsipi

1. **Foydalanuvchi amal qiladi** (masalan, ovqat qo'shadi)
2. **UI darhol yangilanadi** (vaqtinchalik ma'lumot bilan)
3. **Server'ga so'rov yuboriladi** (background'da)
4. **Javob keladi:**
   - ✅ Muvaffaqiyatli: UI allaqachon yangilangan, server ma'lumotlari bilan almashtirish
   - ❌ Xatolik: UI'ni oldingi holatga qaytarish

## 🧪 Xatoliklarni boshqarish

Har bir mutation'da:
- `onMutate`: Previous state saqlanadi
- `onError`: Previous state qaytariladi
- `onSettled`: Har qanday holatda ham invalidation

## 📝 Misollar

### Ovqat qo'shish:

```typescript
const addMealMutation = useAddMeal();

// Optimistic update bilan qo'shish
await addMealMutation.mutateAsync({
  food_name: "Osh",
  weight_grams: 300,
  calories: 450,
  protein: 15,
  carbs: 60,
  fat: 12,
});
// UI darhol yangilanadi!
```

### Harakat qo'shish:

```typescript
const addActivityMutation = useAddActivity();

await addActivityMutation.mutateAsync({
  activity_id: "running",
  duration_minutes: 30,
});
// Darhol UI'da ko'rinadi!
```

### Feedback yuborish:

```typescript
const submitFeedbackMutation = useSubmitFeedback();

await submitFeedbackMutation.mutateAsync({
  subject: "Ajoyib ilova!",
  message: "Juda yoqdi",
  rating: 5,
});
// Darhol tarixda ko'rinadi!
```

## 🎯 Kelajakda qo'shilishi mumkin bo'lgan yaxshilanishlar

1. **Offline queue**: Internet yo'q bo'lsa, amallarni navbatga qo'yish
2. **Optimistic updates for history**: Tarix sahifasida ham optimistic update
3. **Undo/Redo funksiyasi**: Foydalanuvchi amallarni bekor qilishi mumkin
4. **Background sync**: Service Worker orqali background'da sinxronlash
5. **Conflict resolution**: Bir necha qurilmadan bir vaqtda o'zgarishlar bo'lsa, to'g'ri hal qilish

## ⚡ Performance monitoring

React Query DevTools orqali monitoring qilish mumkin:
- Cache holatini ko'rish
- Mutation statuslarini kuzatish
- Network so'rovlarini tahlil qilish

---

**Muallif noti**: Bu implementatsiya React Query'ning eng yaxshi amaliyotlariga asoslanadi va production-ready.
