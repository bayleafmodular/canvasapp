const supabase = require('./lib/supabase');

(async () => {
  const { data } = await supabase.from('templates').select('*');
  console.log(JSON.stringify(data[0].objects).slice(0, 50));
  console.log('Type of objects:', typeof data[0].objects);
  console.log('Is Array?', Array.isArray(data[0].objects));
})();
