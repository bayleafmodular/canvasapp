require('dotenv').config();
const supabase = require('../lib/supabase');

(async () => {
  const { data, error } = await supabase.from('templates').select('*');
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  for (const template of data) {
    let changed = false;
    const newObjects = template.objects.map(obj => {
      if (obj.type && obj.type === obj.type.toUpperCase()) {
        changed = true;
        return { ...obj, type: obj.type.toLowerCase() };
      }
      return obj;
    });

    if (changed) {
      const { error: updateError } = await supabase
        .from('templates')
        .update({ objects: newObjects })
        .eq('id', template.id);
      
      if (updateError) {
        console.error('Error updating template', template.name, updateError);
      } else {
        console.log('Successfully updated template:', template.name);
      }
    } else {
      console.log('No changes needed for:', template.name);
    }
  }

  console.log('Done fixing template object types!');
})();
