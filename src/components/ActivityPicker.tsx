import { useState, useEffect, useMemo } from "react";
import { getActivityCatalog } from "../services/api";
import { useUser } from "../stores";
import { useAddActivity } from "../hooks/useActivities";
import BottomSheet from "./BottomSheet";
import { useToast } from "./Toast";
import type { ActivityCatalogItem, ActivityCategory } from "../types";

interface ActivityPickerProps {
  onClose: () => void;
  onActivityAdded?: () => void;
}

const ActivityPicker = ({ onClose, onActivityAdded }: ActivityPickerProps) => {
  const user = useUser();
  const toast = useToast();
  const addActivityMutation = useAddActivity();
  const submitting = addActivityMutation.isPending;

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityCatalogItem[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedActivity, setSelectedActivity] =
    useState<ActivityCatalogItem | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [distance, setDistance] = useState<string>("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await getActivityCatalog();
        setActivities(data.activities);
        setCategories(data.categories);
      } catch (error) {
        console.error("Katalog yuklashda xatolik:", error);
        toast.error("Katalog yuklanmadi");
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesCategory =
        selectedCategory === "all" || activity.category === selectedCategory;
      const matchesSearch = activity.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activities, selectedCategory, searchQuery]);

  const calculateCalories = () => {
    if (!selectedActivity || !user?.weight_kg) return 0;
    const met = selectedActivity.met;
    const durationHours = duration / 60;
    return Math.round(met * user.weight_kg * durationHours);
  };

  const handleAdd = async () => {
    if (!selectedActivity) return;

    try {
      // Optimistic update orqali tezkor qo'shish
      await addActivityMutation.mutateAsync({
        activity_id: selectedActivity.id,
        duration_minutes: duration,
        distance_km: distance ? Number(distance) : undefined,
      });
      toast.success(`${selectedActivity.name} qo'shildi`);
      onActivityAdded?.();
      onClose();
    } catch (error) {
      console.error("Harakat qo'shishda xatolik:", error);
      toast.error("Qo'shishda xatolik");
    }
  };

  const headerTitle = selectedActivity ? "Batafsil kiritish" : "Harakat tanlash";
  const headerIcon = selectedActivity ? selectedActivity.icon : "🏃";

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={headerTitle}
      icon={headerIcon}
      accent="blue"
      heroHeader
      maxHeight="max-h-[92vh]"
      contentPadding={false}
      footer={
        selectedActivity ? (
          <button
            onClick={handleAdd}
            disabled={submitting || duration <= 0}
            className="w-full py-3.5 bg-gradient-to-r from-food-green-500 to-food-green-600 text-white font-bold rounded-2xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Qo'shish — {calculateCalories()} kkal</span>
              </>
            )}
          </button>
        ) : undefined
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-food-green-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-food-brown-600 font-medium">Katalog yuklanmoqda...</p>
        </div>
      ) : !selectedActivity ? (
        <div className="pb-4">
          {/* Search */}
          <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-food-brown-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Qidirish... (masalan: yugurish)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-food-brown-50 rounded-2xl border-2 border-transparent focus:border-food-green-400 focus:bg-white outline-none transition-all font-medium text-food-brown-800"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedCategory === "all"
                    ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white shadow-md"
                    : "bg-food-brown-50 text-food-brown-600 hover:bg-food-brown-100"
                  }`}
              >
                Barchasi
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all flex items-center gap-1.5 ${selectedCategory === cat.id
                      ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white shadow-md"
                      : "bg-food-brown-50 text-food-brown-600 hover:bg-food-brown-100"
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="px-5 space-y-2 mt-2">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 bg-food-brown-50 rounded-2xl">
                <div className="text-3xl mb-2 opacity-60">🔎</div>
                <p className="text-food-brown-500 font-medium">
                  Hech narsa topilmadi
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className="w-full flex items-center gap-3 p-3 bg-white border-2 border-food-brown-100 rounded-2xl hover:border-food-green-300 hover:bg-food-green-50 active:scale-[0.98] transition-all text-left"
                >
                  <span className="text-2xl bg-gradient-to-br from-food-green-100 to-food-blue-100 w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0">
                    {activity.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-food-brown-800 truncate">
                      {activity.name}
                    </div>
                    <div className="text-xs text-food-brown-500 mt-0.5">
                      ~{Math.round(activity.met * (user?.weight_kg || 70))} kkal/soat
                    </div>
                  </div>
                  <div className="text-food-brown-300 text-lg">›</div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Details */
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4 bg-gradient-to-br from-food-green-50 to-food-blue-50 p-4 rounded-2xl border-2 border-food-green-100">
            <div className="text-4xl bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm">
              {selectedActivity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-food-brown-800 truncate">
                {selectedActivity.name}
              </h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-sm text-food-green-600 font-bold hover:underline"
              >
                ← Boshqasini tanlash
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-food-brown-700 mb-2 flex items-center gap-2">
              <span>⏱️</span>
              <span>Davomiyligi</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDuration(Math.max(5, duration - 5))}
                className="w-12 h-12 rounded-2xl bg-food-brown-50 hover:bg-food-brown-100 active:scale-90 flex items-center justify-center text-xl font-bold transition-all"
              >
                −
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full text-center text-2xl font-extrabold py-3 border-2 border-food-green-200 bg-food-green-50/40 rounded-2xl focus:border-food-green-500 focus:bg-white outline-none transition-all"
                />
                <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-food-brown-500 font-medium">
                  daqiqa
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDuration(duration + 5)}
                className="w-12 h-12 rounded-2xl bg-food-brown-50 hover:bg-food-brown-100 active:scale-90 flex items-center justify-center text-xl font-bold transition-all"
              >
                +
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-7">
              {[15, 30, 45, 60, 90].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDuration(min)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${duration === min
                      ? "bg-gradient-to-r from-food-green-500 to-food-green-600 text-white shadow-md"
                      : "bg-food-brown-50 text-food-brown-600 hover:bg-food-brown-100"
                    }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          {selectedActivity.has_distance && (
            <div>
              <label className="text-sm font-bold text-food-brown-700 mb-2 flex items-center gap-2">
                <span>📍</span>
                <span>Masofa (km, ixtiyoriy)</span>
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Masalan: 5"
                className="w-full px-4 py-3 bg-food-brown-50 border-2 border-transparent rounded-2xl focus:border-food-green-400 focus:bg-white outline-none font-bold transition-all"
              />
            </div>
          )}

          {/* Calculated Calories */}
          <div className="bg-gradient-to-br from-food-orange-100 via-food-yellow-50 to-food-orange-100 p-4 rounded-2xl border-2 border-food-orange-200 text-center">
            <div className="text-xs text-food-orange-700 font-bold uppercase tracking-wide mb-1">
              Sarflanadigan kaloriya
            </div>
            <div className="text-4xl font-extrabold text-food-orange-600 flex items-center justify-center gap-2">
              <span>🔥</span>
              <span>{calculateCalories()}</span>
              <span className="text-base text-food-orange-500 font-bold">kkal</span>
            </div>
            {!user?.weight_kg && (
              <div className="text-xs text-food-red-600 mt-2 font-medium">
                ⚠️ Aniq hisoblash uchun sozlamalarda vazningizni kiriting
              </div>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

export default ActivityPicker;
