const supabase = require('../lib/supabase');

const TEMPLATES_TABLE = 'templates';

const toPublicTemplate = (row, { includeData = false } = {}) => {
  if (!row) return null;

  const template = {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includeData) {
    template.objects = row.objects;
    template.layers = row.layers;
  }

  return template;
};

const listTemplates = async () => {
  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select('id,name,category,description,status,objects,layers,created_at,updated_at')
    .neq('status', 'deleted')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  // We include data here because the UI currently expects objects/layers for all templates in list
  return data.map((row) => toPublicTemplate(row, { includeData: true }));
};

const getTemplateById = async (id) => {
  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select('*')
    .eq('id', id)
    .neq('status', 'deleted')
    .maybeSingle();

  if (error) throw error;
  return toPublicTemplate(data, { includeData: true });
};

const createTemplate = async ({ name, category, description, status, objects, layers }) => {
  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .insert({
      name,
      category,
      description,
      status: status || 'active',
      objects: objects || [],
      layers: layers || [],
    })
    .select('*')
    .single();

  if (error) throw error;
  return toPublicTemplate(data, { includeData: true });
};

const updateTemplate = async (id, updatesPayload) => {
  const existing = await getTemplateById(id);
  if (!existing) return null;

  const updates = {};
  if (updatesPayload.name !== undefined) updates.name = updatesPayload.name;
  if (updatesPayload.category !== undefined) updates.category = updatesPayload.category;
  if (updatesPayload.description !== undefined) updates.description = updatesPayload.description;
  if (updatesPayload.status !== undefined) updates.status = updatesPayload.status;
  if (updatesPayload.objects !== undefined) updates.objects = updatesPayload.objects;
  if (updatesPayload.layers !== undefined) updates.layers = updatesPayload.layers;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from(TEMPLATES_TABLE)
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toPublicTemplate(updated, { includeData: true });
};

const deleteTemplate = async (id) => {
  // We do a soft delete to match existing logic
  const existing = await getTemplateById(id);
  if (!existing) return null;

  const { data: updated, error } = await supabase
    .from(TEMPLATES_TABLE)
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toPublicTemplate(updated, { includeData: true });
};

module.exports = {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
