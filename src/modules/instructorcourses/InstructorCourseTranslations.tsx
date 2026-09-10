"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Button,
  Modal,
  Input,
  Spin,
  Tooltip,
} from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  GlobalOutlined,
  RedoOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getCourseTranslationsApi,
  updateCourseTranslationApi,
  regenerateCourseTranslationApi,
} from "@/services/collections";
import { toast } from "@/utils/toast";
import { CourseInfoDataProp } from "@/utils/interface";

const { TextArea } = Input;

interface InstructorCourseTranslationsProps {
  coursesInfo: CourseInfoDataProp | undefined;
  fetchCourseInfo: () => Promise<void>;
}

interface TranslationData {
  locale: string;
  course_name?: string | null;
  about_course?: string | null;
  description?: string | null;
  overview?: string | null;
  learning_points?: string[];
  skills_you_gain?: string[];
  status: string;
  source?: string;
  translated_at?: string | null;
}

const InstructorCourseTranslations: React.FC<InstructorCourseTranslationsProps> = ({
  coursesInfo,
}) => {
  const courseId = coursesInfo?.course_id || "";
  const [loading, setLoading] = useState(false);
  const [regeneratingLang, setRegeneratingLang] = useState<string | null>(null);
  const [translations, setTranslations] = useState<{
    en?: TranslationData;
    pa?: TranslationData;
    fr?: TranslationData;
  }>({});

  // Manual Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLocale, setEditLocale] = useState<"pa" | "fr">("pa");
  const [savingEdit, setSavingEdit] = useState(false);
  const [formData, setFormData] = useState({
    course_name: "",
    about_course: "",
    description: "",
    overview: "",
    learning_points: [] as string[],
    skills_you_gain: [] as string[],
  });

  const fetchTranslations = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await getCourseTranslationsApi(courseId);
      if (res?.status && res?.data) {
        setTranslations(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load course translations", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const handleRegenerate = async (locale?: string) => {
    setRegeneratingLang(locale || "all");
    try {
      const res = await regenerateCourseTranslationApi(courseId, locale);
      if (res?.status) {
        toast.success(
          locale
            ? `Translation queued for ${locale === "pa" ? "Punjabi" : "French"}`
            : "Translations queued for Punjabi and French",
        );
        // Refresh after short delay
        setTimeout(() => {
          fetchTranslations();
        }, 1500);
      } else {
        toast.error(res?.message || "Failed to trigger translation");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error requesting translation");
    } finally {
      setRegeneratingLang(null);
    }
  };

  const openEditModal = (locale: "pa" | "fr") => {
    setEditLocale(locale);
    const data = translations[locale];
    const sourceEn = translations.en;

    setFormData({
      course_name: data?.course_name || sourceEn?.course_name || "",
      about_course: data?.about_course || sourceEn?.about_course || "",
      description: data?.description || sourceEn?.description || "",
      overview: data?.overview || sourceEn?.overview || "",
      learning_points: data?.learning_points?.length
        ? [...data.learning_points]
        : sourceEn?.learning_points
          ? [...sourceEn.learning_points]
          : [],
      skills_you_gain: data?.skills_you_gain?.length
        ? [...data.skills_you_gain]
        : sourceEn?.skills_you_gain
          ? [...sourceEn.skills_you_gain]
          : [],
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await updateCourseTranslationApi(courseId, {
        locale: editLocale,
        ...formData,
      });

      if (res?.status) {
        toast.success(
          `${editLocale === "pa" ? "Punjabi" : "French"} translation saved as Manually Edited`,
        );
        setEditModalVisible(false);
        fetchTranslations();
      } else {
        toast.error(res?.message || "Failed to save translation");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save translation");
    } finally {
      setSavingEdit(false);
    }
  };

  const renderStatusTag = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Completed
          </Tag>
        );
      case "processing":
        return (
          <Tag color="processing" icon={<SyncOutlined spin />}>
            Translating...
          </Tag>
        );
      case "pending":
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Queued
          </Tag>
        );
      case "outdated":
        return (
          <Tag color="orange" icon={<ExclamationCircleOutlined />}>
            Outdated (English Changed)
          </Tag>
        );
      case "failed":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Failed
          </Tag>
        );
      default:
        return <Tag color="default">Pending</Tag>;
    }
  };

  const renderSourceTag = (source?: string) => {
    if (source === "manually_edited") {
      return (
        <Tag color="purple">
          Manually Edited (Protected)
        </Tag>
      );
    }
    if (source === "machine_generated") {
      return <Tag color="cyan">AI Translated</Tag>;
    }
    return <Tag color="blue">Original Source</Tag>;
  };

  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <GlobalOutlined className="text-xl text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Multilingual Course Translations
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Courses are created in English and automatically translated into
            Punjabi and French. You can regenerate or manually refine translations
            below.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button
            type="primary"
            icon={<RedoOutlined />}
            loading={regeneratingLang === "all"}
            onClick={() => handleRegenerate()}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Regenerate All
          </Button>
          <Button
            icon={<SyncOutlined />}
            loading={loading}
            onClick={() => fetchTranslations()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading && Object.keys(translations).length === 0 ? (
        <div className="py-16 text-center">
          <Spin size="large" />
          <p className="mt-3 text-slate-500 text-sm">Loading translations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* English Source Card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/20 p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">🇬🇧</span>
                  <div>
                    <h3 className="font-bold text-slate-900">English</h3>
                    <span className="text-xs text-slate-500">Source Language</span>
                  </div>
                </div>
                <Tag color="blue">Primary</Tag>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Course Title
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-2">
                    {translations.en?.course_name || coursesInfo?.course_name || "Untitled Course"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Description
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-3">
                    {translations.en?.description || coursesInfo?.description || "No description"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Learning Points
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {translations.en?.learning_points?.length || coursesInfo?.course_learning_points?.length || 0} points
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-500">
              <span>Authoritative content</span>
              <span className="font-medium text-blue-600">Locked to Instructor</span>
            </div>
          </div>

          {/* Punjabi Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">🇮🇳</span>
                  <div>
                    <h3 className="font-bold text-slate-900">ਪੰਜਾਬੀ (Punjabi)</h3>
                    <span className="text-xs text-slate-500">Gurmukhi Unicode</span>
                  </div>
                </div>
                {renderStatusTag(translations.pa?.status)}
              </div>

              <div className="mb-4">{renderSourceTag(translations.pa?.source)}</div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Translated Title
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-2">
                    {translations.pa?.course_name || (
                      <span className="text-slate-400 italic">
                        {translations.pa?.status === "processing"
                          ? "Translating..."
                          : "Translation pending"}
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Description
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-3">
                    {translations.pa?.description || (
                      <span className="text-slate-400 italic">No translation yet</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal("pa")}
              >
                Edit Translation
              </Button>

              <Tooltip title="Regenerate Punjabi translation with AI">
                <Button
                  size="small"
                  icon={<RedoOutlined />}
                  loading={regeneratingLang === "pa"}
                  onClick={() => handleRegenerate("pa")}
                >
                  Regenerate
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* French Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">🇫🇷</span>
                  <div>
                    <h3 className="font-bold text-slate-900">Français (French)</h3>
                    <span className="text-xs text-slate-500">French Translation</span>
                  </div>
                </div>
                {renderStatusTag(translations.fr?.status)}
              </div>

              <div className="mb-4">{renderSourceTag(translations.fr?.source)}</div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Translated Title
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-2">
                    {translations.fr?.course_name || (
                      <span className="text-slate-400 italic">
                        {translations.fr?.status === "processing"
                          ? "Translating..."
                          : "Translation pending"}
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Description
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-3">
                    {translations.fr?.description || (
                      <span className="text-slate-400 italic">No translation yet</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal("fr")}
              >
                Edit Translation
              </Button>

              <Tooltip title="Regenerate French translation with AI">
                <Button
                  size="small"
                  icon={<RedoOutlined />}
                  loading={regeneratingLang === "fr"}
                  onClick={() => handleRegenerate("fr")}
                >
                  Regenerate
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Manual Translation Editor Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            <span>
              Edit Translation — {editLocale === "pa" ? "ਪੰਜਾਬੀ (Punjabi)" : "Français (French)"}
            </span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        confirmLoading={savingEdit}
        okText="Save Translation"
        width={720}
      >
        <div className="py-2 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Note:</strong> Saving manual modifications will tag this translation as{" "}
            <strong>Manually Edited</strong>, protecting it from being automatically overwritten
            when the English course content is modified.
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Title
            </label>
            <div className="text-xs text-slate-500 mb-1">
              English: <em>{translations.en?.course_name || "—"}</em>
            </div>
            <Input
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              placeholder="Enter translated title"
            />
          </div>

          {/* About Course */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              About Course (Short summary)
            </label>
            {translations.en?.about_course && (
              <div className="text-xs text-slate-500 mb-1 line-clamp-2">
                English: <em>{translations.en.about_course}</em>
              </div>
            )}
            <TextArea
              rows={3}
              value={formData.about_course}
              onChange={(e) => setFormData({ ...formData, about_course: e.target.value })}
              placeholder="Enter translated summary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Description
            </label>
            <TextArea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter translated full description"
            />
          </div>

          {/* Overview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Overview
            </label>
            <TextArea
              rows={3}
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              placeholder="Enter translated overview"
            />
          </div>

          {/* Learning Points */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Learning Points
              </label>
              <Button
                size="small"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  setFormData({
                    ...formData,
                    learning_points: [...formData.learning_points, ""],
                  })
                }
              >
                Add Point
              </Button>
            </div>
            <div className="space-y-2">
              {formData.learning_points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={pt}
                    onChange={(e) => {
                      const updated = [...formData.learning_points];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, learning_points: updated });
                    }}
                    placeholder={`Point ${idx + 1}`}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const updated = formData.learning_points.filter((_, i) => i !== idx);
                      setFormData({ ...formData, learning_points: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Skills You Gain */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Skills You Gain
              </label>
              <Button
                size="small"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  setFormData({
                    ...formData,
                    skills_you_gain: [...formData.skills_you_gain, ""],
                  })
                }
              >
                Add Skill
              </Button>
            </div>
            <div className="space-y-2">
              {formData.skills_you_gain.map((sk, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={sk}
                    onChange={(e) => {
                      const updated = [...formData.skills_you_gain];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, skills_you_gain: updated });
                    }}
                    placeholder={`Skill ${idx + 1}`}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const updated = formData.skills_you_gain.filter((_, i) => i !== idx);
                      setFormData({ ...formData, skills_you_gain: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorCourseTranslations;
