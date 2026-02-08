import { supabase } from '../lib/supabaseClient';

const LESSON_CONTENT_BUCKET = 'lesson-content';

const sanitizeFilename = (name) => String(name || 'file')
  .replace(/[^a-zA-Z0-9._-]/g, '_')
  .replace(/_+/g, '_')
  .slice(0, 120);

export const uploadLessonContentFile = async ({ courseId, file }) => {
  if (!supabase) throw new Error('Supabase not configured');
  if (!file) throw new Error('No file provided');

  const safeName = sanitizeFilename(file.name);
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
  const path = `${courseId}/${id}-${safeName}`;

  const { error: uploadError } = await supabase
    .storage
    .from(LESSON_CONTENT_BUCKET)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    // Common causes: bucket missing, bucket not public, RLS/storage policies
    throw new Error(uploadError.message || 'Failed to upload file');
  }

  const { data } = supabase.storage.from(LESSON_CONTENT_BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error(`Uploaded but could not resolve public URL. Ensure Supabase bucket "${LESSON_CONTENT_BUCKET}" exists and is public.`);
  }

  return { publicUrl, path, bucket: LESSON_CONTENT_BUCKET };
};

const isDuplicateError = (error) => {
  const code = error?.code || error?.details;
  return code === '23505' || String(error?.message || '').toLowerCase().includes('duplicate');
};

export const fetchCoursesWithLessons = async () => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('courses')
    .select('*, lessons(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    tags: course.tags || [],
    image: course.image_url,
    website: course.website || '',
    visibility: course.visibility || 'everyone',
    access: course.access || 'payment',
    price: Number(course.price ?? 0),
    published: Boolean(course.published),
    views: Number(course.views ?? 0),
    createdAt: course.created_at,
    certificateEnabled: course.certificate_enabled !== false,
    authorId: course.author_id,
    responsibleId: course.responsible_id || course.author_id,
    adminId: course.admin_id || course.author_id,
    attendees: Array.isArray(course.attendees) ? course.attendees : (course.attendees || []),
    lessons: (course.lessons || [])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        description: l.description || '',
        url: l.content_url || '',
        duration: l.duration || 0,
        allowDownload: Boolean(l.allow_download),
        attachments: l.attachments || [],
        quizId: l.quiz_id,
        moduleNumber: l.order_index || 0,
      })),
  }));
};

export const fetchProfiles = async () => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, points, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((p) => ({
    id: p.id,
    email: p.email,
    name: p.full_name,
    full_name: p.full_name,
    avatar: p.avatar_url,
    avatar_url: p.avatar_url,
    role: p.role,
    points: p.points || 0,
  }));
};

const toDbCoursePayload = (courseData, authorId) => ({
  title: courseData.title,
  description: courseData.description,
  tags: courseData.tags || [],
  image_url: courseData.image,
  website: courseData.website || '',
  visibility: courseData.visibility || 'everyone',
  access: courseData.access || 'payment',
  price: Number(courseData.price ?? 0),
  published: Boolean(courseData.published),
  views: Number(courseData.views ?? 0),
  certificate_enabled: courseData.certificateEnabled !== false,
  attendees: courseData.attendees || [],
  author_id: authorId,
  responsible_id: courseData.responsibleId || authorId,
  admin_id: courseData.adminId || authorId,
});

export const createCourseDb = async ({ courseData, authorId }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const payload = toDbCoursePayload(courseData, authorId);
  const { data, error } = await supabase
    .from('courses')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const updateCourseDb = async ({ courseId, updates }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {};
  if ('title' in updates) payload.title = updates.title;
  if ('description' in updates) payload.description = updates.description;
  if ('tags' in updates) payload.tags = updates.tags || [];
  if ('image' in updates) payload.image_url = updates.image;
  if ('website' in updates) payload.website = updates.website || '';
  if ('visibility' in updates) payload.visibility = updates.visibility;
  if ('access' in updates) payload.access = updates.access;
  if ('price' in updates) payload.price = Number(updates.price ?? 0);
  if ('published' in updates) payload.published = Boolean(updates.published);
  if ('views' in updates) payload.views = Number(updates.views ?? 0);
  if ('certificateEnabled' in updates) payload.certificate_enabled = updates.certificateEnabled !== false;
  if ('attendees' in updates) payload.attendees = updates.attendees || [];
  if ('responsibleId' in updates) payload.responsible_id = updates.responsibleId;
  if ('adminId' in updates) payload.admin_id = updates.adminId;

  const { error } = await supabase
    .from('courses')
    .update(payload)
    .eq('id', courseId);
  if (error) throw error;
};

export const deleteCourseDb = async (courseId) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw error;
};

const toDbLessonPayload = (courseId, lessonData, orderIndex) => ({
  course_id: courseId,
  title: lessonData.title,
  description: lessonData.description || '',
  type: lessonData.type || 'video',
  content_url: lessonData.url || '',
  duration: Number(lessonData.duration) || 0,
  allow_download: Boolean(lessonData.allowDownload),
  attachments: lessonData.attachments || [],
  quiz_id: lessonData.quizId || null,
  order_index: Number(orderIndex ?? lessonData.moduleNumber) || 0,
});

export const createLessonDb = async ({ courseId, lessonData, orderIndex }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const payload = toDbLessonPayload(courseId, lessonData, orderIndex);
  const { data, error } = await supabase
    .from('lessons')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const updateLessonDb = async ({ lessonId, updates }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {};
  if ('title' in updates) payload.title = updates.title;
  if ('description' in updates) payload.description = updates.description;
  if ('type' in updates) payload.type = updates.type;
  if ('url' in updates) payload.content_url = updates.url;
  if ('duration' in updates) payload.duration = Number(updates.duration) || 0;
  if ('allowDownload' in updates) payload.allow_download = Boolean(updates.allowDownload);
  if ('attachments' in updates) payload.attachments = updates.attachments || [];
  if ('quizId' in updates) payload.quiz_id = updates.quizId || null;
  if ('moduleNumber' in updates) payload.order_index = Number(updates.moduleNumber) || 0;

  const { error } = await supabase
    .from('lessons')
    .update(payload)
    .eq('id', lessonId);
  if (error) throw error;
};

export const deleteLessonDb = async (lessonId) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw error;
};

export const logLoginEvent = async ({ userId, event = 'login', metadata = {} }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('login_events').insert({
    user_id: userId,
    event,
    metadata,
  });
  if (error) throw error;
};

export const updateLastLoginAt = async (userId) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
};

export const fetchEnrollmentsForUser = async (userId) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;

  // Pull progress joined with lessons to map completed lessons per course
  const { data: progressRows, error: progressError } = await supabase
    .from('progress')
    .select('lesson_id, lessons ( course_id )')
    .eq('user_id', userId);
  if (progressError) throw progressError;

  const completedByCourseId = new Map();
  for (const row of progressRows || []) {
    const courseId = row?.lessons?.course_id;
    if (!courseId) continue;
    const list = completedByCourseId.get(courseId) || [];
    list.push(row.lesson_id);
    completedByCourseId.set(courseId, list);
  }

  return (enrollments || []).map((e) => ({
    userId: e.user_id,
    courseId: e.course_id,
    enrolledDate: e.enrolled_at,
    startDate: e.start_date,
    completedDate: e.completed_date,
    status: e.status,
    progress: e.progress,
    timeSpent: e.time_spent,
    completedLessons: completedByCourseId.get(e.course_id) || [],
  }));
};

export const enrollInCourse = async (userId, courseId) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
    status: 'not-started',
    progress: 0,
  });
  if (error) throw error;
  return true;
};

export const completeLessonForUser = async ({ userId, courseId, lessonId, totalLessons, previouslyCompleted, previousProgress }) => {
  if (!supabase) throw new Error('Supabase not configured');

  let didInsertProgress = false;
  const { error: insertError } = await supabase.from('progress').insert({
    user_id: userId,
    lesson_id: lessonId,
  });

  if (insertError) {
    if (!isDuplicateError(insertError)) throw insertError;
  } else {
    didInsertProgress = true;
  }

  // Recount completed lessons for this course
  const { data: courseLessonRows, error: lessonError } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId);
  if (lessonError) throw lessonError;

  const courseLessonIds = (courseLessonRows || []).map((l) => l.id);

  const { data: completedRows, error: completedError } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', courseLessonIds);
  if (completedError) throw completedError;

  const completedCount = (completedRows || []).length;
  const denom = totalLessons || courseLessonIds.length || 1;
  const progress = Math.round((completedCount / denom) * 100);

  const status = progress === 100 ? 'completed' : 'in-progress';
  const updates = {
    progress,
    status,
    start_date: previouslyCompleted ? undefined : new Date().toISOString(),
    completed_date: progress === 100 ? new Date().toISOString() : null,
  };

  // Only set start_date if it doesn't exist
  const { data: existingEnrollment, error: enrollmentFetchError } = await supabase
    .from('enrollments')
    .select('start_date, progress')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  if (enrollmentFetchError) throw enrollmentFetchError;

  const updatePayload = {
    progress,
    status,
    completed_date: progress === 100 ? new Date().toISOString() : null,
    start_date: existingEnrollment?.start_date || new Date().toISOString(),
  };

  const { error: enrollmentUpdateError } = await supabase
    .from('enrollments')
    .update(updatePayload)
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (enrollmentUpdateError) throw enrollmentUpdateError;

  // Award points
  // - 10 XP per newly completed lesson
  // - 50 XP bonus for first time reaching 100%
  let awarded = 0;
  if (didInsertProgress) {
    const { data: newPoints, error: awardError } = await supabase.rpc('award_points', {
      p_user_id: userId,
      p_delta: 10,
      p_reason: 'lesson_completed',
      p_metadata: { courseId, lessonId },
    });
    if (awardError) throw awardError;
    awarded += 10;
  }

  const wasPreviouslyComplete = Number(previousProgress ?? existingEnrollment?.progress ?? 0) >= 100;
  if (progress === 100 && !wasPreviouslyComplete) {
    const { error: awardError } = await supabase.rpc('award_points', {
      p_user_id: userId,
      p_delta: 50,
      p_reason: 'course_completed_bonus',
      p_metadata: { courseId },
    });
    if (awardError) throw awardError;
    awarded += 50;
  }

  return { progress, status, awardedPoints: awarded, completedLessonIds: (completedRows || []).map(r => r.lesson_id) };
};

export const fetchUserBadges = async (userId) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_key, earned_at, badges ( name, points_required, icon, color )')
    .eq('user_id', userId)
    .order('earned_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const ensureBadgesForPoints = async (userId, points) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: badges, error: badgeError } = await supabase
    .from('badges')
    .select('badge_key, points_required')
    .order('points_required', { ascending: true });
  if (badgeError) throw badgeError;

  const earned = (badges || []).filter((b) => (points || 0) >= (b.points_required || 0));
  if (!earned.length) return;

  // Upsert earned badges
  const rows = earned.map((b) => ({ user_id: userId, badge_key: b.badge_key }));
  const { error: upsertError } = await supabase
    .from('user_badges')
    .upsert(rows, { onConflict: 'user_id,badge_key', ignoreDuplicates: true });
  if (upsertError) throw upsertError;
};
