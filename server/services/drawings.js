const supabase = require('../lib/supabase');

const DRAWINGS_TABLE = 'drawings';

const toPublicDrawing = (row, { includeData = false } = {}) => {
  if (!row) return null;

  const drawing = {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includeData) {
    drawing.data = row.data;
  }

  return drawing;
};

const listDrawingsForUser = async (userId) => {
  const { data, error } = await supabase
    .from(DRAWINGS_TABLE)
    .select('id,name,created_at,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data.map((row) => toPublicDrawing(row));
};

const createDrawingForUser = async (userId, { name, data }) => {
  const { data: drawing, error } = await supabase
    .from(DRAWINGS_TABLE)
    .insert({
      user_id: userId,
      name,
      data,
    })
    .select('id,name,created_at,updated_at')
    .single();

  if (error) throw error;
  return toPublicDrawing(drawing);
};

const getDrawingForUser = async (userId, id) => {
  const { data, error } = await supabase
    .from(DRAWINGS_TABLE)
    .select('id,name,data,created_at,updated_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return toPublicDrawing(data, { includeData: true });
};

const deleteDrawingForUser = async (userId, id) => {
  const existing = await getDrawingForUser(userId, id);
  if (!existing) return null;

  const { error } = await supabase
    .from(DRAWINGS_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return existing;
};

const updateDrawingForUser = async (userId, id, { name, data }) => {
  const existing = await getDrawingForUser(userId, id);
  if (!existing) return null;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (data !== undefined) updates.data = data;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from(DRAWINGS_TABLE)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id,name,created_at,updated_at')
    .single();

  if (error) throw error;
  return toPublicDrawing(updated);
};

module.exports = {
  listDrawingsForUser,
  createDrawingForUser,
  getDrawingForUser,
  updateDrawingForUser,
  deleteDrawingForUser,
};
