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
      // Fix wall offsets: walls with points already include the absolute coordinates, 
      // so x and y should be 0.
      if (obj.type === 'wall' && (obj.x !== 0 || obj.y !== 0)) {
        changed = true;
        return { ...obj, x: 0, y: 0 };
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
        console.log('Successfully fixed walls in template:', template.name);
      }
    }
  }

  console.log('Done fixing template wall offsets!');
})();
