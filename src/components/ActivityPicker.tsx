import { useState, useEffect, useMemo } from "react";
import { getActivityCatalog, addActivity } from "../services/api";
import { useAuthStore, useUser } from "../stores";
import type { ActivityCatalogItem, ActivityCategory } from "../types";

interface ActivityPickerProps {
  onClose: () => void;
  onActivityAdded: () => void;
}

const ActivityPicker = ({ onClose, onActivityAdded }: ActivityPickerProps) => {
  const token = useAuthStore((state) => state.token);
  const user = useUser();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState<ActivityCatalogItem[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedActivity, setSelectedActivity] = useState<ActivityCatalogItem | null>(null);
  const [duration, setDuration] = useState<number>(30); // Default 30 min
  const [distance, setDistance] = useState<string>(""); // Optional distance

  // Load catalog
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await getActivityCatalog();
        setActivities(data.activities);
        setCategories(data.categories);
      } catch (error) {
        console.error("Katalog yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory;
      const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activities, selectedCategory, searchQuery]);

  // Calculate calories
  const calculateCalories = () => {
    if (!selectedActivity || !user?.weight_kg) return 0;
    const met = selectedActivity.met;
    const durationHours = duration / 60;
    return Math.round(met * user.weight_kg * durationHours);
  };

  const handleAdd = async () => {
    if (!selectedActivity || !token) return;

    setSubmitting(true);
    try {
      await addActivity(token, {
        activity_id: selectedActivity.id,
        duration_minutes: duration,
        distance_km: distance ? Number(distance) : undefined,
      });
      onActivityAdded();
      onClose();
    } catch (error) {
      console.error("Harakat qo'shishda xatolik:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p>Katalog yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col md:h-[calc(100vh-5rem)] h-[calc(100vh-4rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedActivity ? "Batafsil kiritish" : "Harakat tanlash"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {!selectedActivity ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Qidirish... (masalan: yugurish)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-food-green-500 outline-none"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-food-green-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Barchasi
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-1 ${
                      selectedCategory === cat.id
                        ? "bg-food-green-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-2">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Hech narsa topilmadi 😔
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
                      className="w-full flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-food-green-300 hover:bg-food-green-50 transition-all text-left shadow-sm"
                    >
                      <span className="text-3xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg">
                        {activity.icon}
                      </span>
                      <div>
                        <div className="font-bold text-gray-800">{activity.name}</div>
                        <div className="text-xs text-gray-500">
                          ~{Math.round(activity.met * (user?.weight_kg || 70))} kkal/soat
                        </div>
                      </div>
                      <div className="ml-auto text-gray-400">›</div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Details Form */
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-food-green-50 p-4 rounded-xl">
                <div className="text-5xl">{selectedActivity.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedActivity.name}</h3>
                  <button 
                    onClick={() => setSelectedActivity(null)}
                    className="text-sm text-food-green-600 font-medium hover:underline"
                  >
                    ← Boshqasini tanlash
                  </button>
                </div>
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ⏱️ Davomiyligi (daqiqa)
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setDuration(Math.max(5, duration - 5))}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                  >
                    -
                  </button>
                  <div className="flex-1 relative">
                     <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full text-center text-2xl font-bold py-2 border-2 border-food-green-200 rounded-xl focus:border-food-green-500 outline-none"
                    />
                    <span className="text-xs text-gray-500 absolute bottom-[-20px] left-0 right-0 text-center">daqiqa</span>
                  </div>
                  <button 
                    onClick={() => setDuration(duration + 5)}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                  >
                    +
                  </button>
                </div>
                
                {/* Quick select */}
                <div className="flex justify-center gap-2 mt-6">
                  {[15, 30, 45, 60, 90].map(min => (
                    <button
                      key={min}
                      onClick={() => setDuration(min)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        duration === min 
                          ? "bg-food-green-100 text-food-green-700 border border-food-green-300" 
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance Input (Optional) */}
              {selectedActivity.has_distance && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📍 Masofa (km, ixtiyoriy)
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Masalan: 5"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-food-green-500 outline-none font-medium"
                  />
                </div>
              )}

              {/* Calculated Calories */}
              <div className="bg-gradient-to-r from-food-orange-50 to-food-yellow-50 p-4 rounded-xl border border-food-orange-200 text-center">
                <div className="text-sm text-food-brown-500 mb-1">Sarflanadigan kaloriya</div>
                <div className="text-3xl font-extrabold text-food-orange-600 flex items-center justify-center gap-1">
                  🔥 {calculateCalories()} <span className="text-lg text-food-orange-400">kkal</span>
                </div>
                {!user?.weight_kg && (
                   <div className="text-xs text-red-500 mt-2">
                     ⚠️ Aniq hisoblash uchun sozlamalarda vazningizni kiriting
                   </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        {selectedActivity && (
          <div className="p-4 border-t bg-white safe-area-bottom rounded-b-3xl">
            <button
              onClick={handleAdd}
              disabled={submitting || duration <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-food-green-500 to-food-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <span>✅</span>
                  <span>Qo'shish</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPicker;
